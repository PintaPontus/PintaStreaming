import {EmulatorEnv} from 'firebase-auth-cloudflare-workers';

export interface Env extends EmulatorEnv {
  FIREBASE_PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  PUBLIC_JWK_CACHE_KV: KVNamespace;
  /** Contenuto integrale del service-account JSON (secret) */
  SERVICE_ACCOUNT_JSON: string;
}
