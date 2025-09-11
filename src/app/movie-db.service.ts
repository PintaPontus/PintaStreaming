import {Injectable, signal, WritableSignal} from '@angular/core';
import {ShowDetails, ShowLanguage, ShowResultsList, ShowTranslationsList} from '../interfaces/show';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieDBService {
  private language: WritableSignal<string> = signal(this.initLanguage());

  setLanguage(langId: string) {
    this.language.set(langId)
    localStorage.setItem('language', JSON.stringify(this.language()));
  }

  initLanguage() {
    const memorizedLanguage = localStorage.getItem('language');
    return memorizedLanguage ? JSON.parse(memorizedLanguage) : 'it';
  }


  getLanguage() {
    return this.language.asReadonly()
  }

  async getLanguages() {
    return await this.get<ShowLanguage[]>(`https://api.themoviedb.org/3/configuration/languages`)
  }

  async getInfoMovie(id: number | null): Promise<ShowDetails> {
    const showId = id !== null ? id : 0;
    const showDetails = await this.get<ShowDetails>(`https://api.themoviedb.org/3/movie/${showId}`);
    if (this.language()) {
      showDetails.translations = await this.get<ShowTranslationsList>(`https://api.themoviedb.org/3/movie/${showId}/translations`);
    }
    return showDetails;
  }

  async getInfoTvSeries(id: number): Promise<ShowDetails> {
    const showId = id !== null ? id : 0;
    const showDetails = await this.get<ShowDetails>(`https://api.themoviedb.org/3/tv/${showId}`);
    if (this.language()) {
      showDetails.translations = await this.get<ShowTranslationsList>(`https://api.themoviedb.org/3/tv/${showId}/translations`);
    }
    return showDetails;
  }

  async search(textSearch: string): Promise<ShowResultsList> {
    const params = new URLSearchParams();
    params.append("query", textSearch);
    params.append("include_adult", true.toString());
    return await this.get<ShowResultsList>(`https://api.themoviedb.org/3/search/multi?${params}`);
  }

  async getShows(link: string) {
    return await this.get<ShowResultsList>(`https://api.themoviedb.org/3/${link}`);
  }

  private async get<T>(url: string): Promise<T> {
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
