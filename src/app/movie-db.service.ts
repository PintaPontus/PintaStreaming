import { Injectable } from '@angular/core';
import {ShowDetails, ShowSearchList} from '../interfaces/show';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieDBService {

  async getInfoMovie(id: string): Promise<ShowDetails> {
    return await this.get<ShowDetails>(`https://api.themoviedb.org/3/movie/${id}`);
  }

  async getInfoSeries(id: string): Promise<ShowDetails> {
    return await this.get<ShowDetails>(`https://api.themoviedb.org/3/tv/${id}`);
  }

  async search(textSearch: string): Promise<ShowSearchList> {
    const params = new URLSearchParams();
    params.append("query", textSearch);
    params.append("include_adult", true.toString());
    return await this.get<ShowSearchList>(`https://api.themoviedb.org/3/search/multi?${params}`);
  }

  async get<T>(url: string): Promise<T>{
    try {
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: this.generateHeaders(),
        },
      );

      return await response.json() as T;
    }catch (e) {
      console.error(e);
    }
    return {} as T;
  }

  private generateHeaders(headers?: {
    [key: string]: string | null;
  }) {
    const httpHeaders = new Headers();
    httpHeaders.set('Authorization', `Bearer ${(environment.movieDBKey)}`)
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
