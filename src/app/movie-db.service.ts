import { Injectable } from '@angular/core';
import {ShowDetails, ShowSearchList} from '../interfaces/show';

@Injectable({
  providedIn: 'root'
})
export class MovieDBService {

  private movieDBApiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDY4ZWU1NTVmMDA2YjY2MTQ1Y2Q1NTEyMDYwOWI5OSIsIm5iZiI6MTc1NjEzODAxMy45OTQsInN1YiI6IjY4YWM4YTFkNmZhN2JjM2FkYmE5YTc4MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1IrB7kgYfmZCtO2Zgp39u_kcrIO9267GHZ-ljKugvOI';

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
    httpHeaders.set('Authorization', `Bearer ${(this.movieDBApiKey)}`)
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
