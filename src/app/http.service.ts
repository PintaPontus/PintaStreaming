import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  async get<T>(url: string, headers?: { [key: string]: string | null }, abortSignal?: AbortSignal): Promise<T> {
    try {
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: this.generateHeaders(headers),
          signal: abortSignal,
        },
      );

      return await response.json() as T;
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        throw e;
      }
      console.error('Error while retrieving data: ', e);
    }
    return {} as T;
  }

  private generateHeaders(headers?: { [key: string]: string | null }) {
    const httpHeaders = new Headers();
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (value) {
          httpHeaders.set(key, value);
        }
      })
    }
    return httpHeaders;
  }
}
