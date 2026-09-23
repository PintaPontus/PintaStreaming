import {ServiceAccountCredential} from 'firebase-auth-cloudflare-workers';

interface CachedToken {
  token: string;
  expiresAt: number;
}
let memoryCache: CachedToken | null = null;
const KV_KEY = 'gcp-sa-access-token';
const SKEW_MS = 60_000;

export async function getServiceAccountAccessToken(env: Env): Promise<string> {
  const now = Date.now();

  if (isTokenStillValid(memoryCache, now)) {
    return memoryCache!.token;
  }

  const fromKv = await env.PUBLIC_JWK_CACHE_KV.get<CachedToken>(KV_KEY, 'json');
  if (isTokenStillValid(fromKv, now)) {
    memoryCache = fromKv;
    return fromKv!.token;
  }

  const credential = new ServiceAccountCredential(env.SERVICE_ACCOUNT_JSON);
  const {access_token, expires_in} = await credential.getAccessToken();

  const entry: CachedToken = {
    token: access_token,
    expiresAt: now + expires_in * 1000,
  };

  memoryCache = entry;
  await env.PUBLIC_JWK_CACHE_KV.put(KV_KEY, JSON.stringify(entry), {
    expirationTtl: Math.max(60, expires_in - 60),
  });

  return access_token;
}

function isTokenStillValid(token: CachedToken | null, now: number = Date.now()) {
  return (token && token.expiresAt - SKEW_MS > now) ?? false;
}

export type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

export interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

export function toValue(input: unknown): FirestoreValue {
  if (input === null || input === undefined) return {nullValue: null};
  if (input instanceof Date) return {timestampValue: input.toISOString()};
  if (typeof input === 'boolean') return {booleanValue: input};
  if (typeof input === 'string') return {stringValue: input};
  if (typeof input === 'number') {
    return Number.isInteger(input)
      ? {integerValue: String(input)}
      : {doubleValue: input};
  }
  if (Array.isArray(input)) {
    return {arrayValue: {values: input.map(toValue)}};
  }
  if (typeof input === 'object') {
    return {mapValue: {fields: toFields(input as Record<string, unknown>)}};
  }
  throw new TypeError(`Tipo non supportato da Firestore: ${typeof input}`);
}

export function toFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, toValue(v)]),
  );
}

export function fromValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('stringValue' in value) return value.stringValue;
  if ('doubleValue' in value) return value.doubleValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in value) return fromFields(value.mapValue.fields ?? {});
  return null;
}

export function fromFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromValue(v)]));
}

export class FirestoreError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export class FirestoreRestClient {
  private readonly base: string;

  constructor(
    projectId: string,
    private readonly accessToken: string,
    databaseId = '(default)',
  ) {
    this.base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!res.ok) {
      throw new FirestoreError(res.status, await res.text());
    }
    return res.json<T>();
  }

  async create(
    collection: string,
    data: Record<string, unknown>,
    documentId?: string,
  ): Promise<FirestoreDocument> {
    const qs = documentId ? `?documentId=${encodeURIComponent(documentId)}` : '';
    return this.request<FirestoreDocument>(`/${collection}${qs}`, {
      method: 'POST',
      body: JSON.stringify({fields: toFields(data)}),
    });
  }

  async get(collection: string, documentId: string): Promise<FirestoreDocument> {
    return this.request<FirestoreDocument>(`/${collection}/${documentId}`, {method: 'GET'});
  }

  async update(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
  ): Promise<FirestoreDocument> {
    const mask = Object.keys(data)
      .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
      .join('&');

    return this.request<FirestoreDocument>(`/${collection}/${documentId}?${mask}`, {
      method: 'PATCH',
      body: JSON.stringify({fields: toFields(data)}),
    });
  }

  async delete(collection: string, documentId: string): Promise<void> {
    await this.request<unknown>(`/${collection}/${documentId}`, {method: 'DELETE'});
  }

  async query(structuredQuery: Record<string, unknown>): Promise<FirestoreDocument[]> {
    const rows = await this.request<Array<{ document?: FirestoreDocument }>>(':runQuery', {
      method: 'POST',
      body: JSON.stringify({structuredQuery}),
    });
    return rows.filter((r) => r.document).map((r) => r.document!);
  }
}
