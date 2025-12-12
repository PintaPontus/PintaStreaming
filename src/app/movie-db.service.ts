import {Injectable, signal, WritableSignal} from '@angular/core';
import {
  ShowDetails,
  ShowLanguage,
  ShowReference,
  ShowResultsList,
  ShowTranslationsList,
  ShowTypeEnum
} from '../interfaces/show';
import {environment} from '../environments/environment';
import {UserListItem} from '../interfaces/users';

@Injectable({
  providedIn: 'root'
})
export class MovieDBService {
  private readonly language: WritableSignal<string> = signal(this.initLanguage());

  // =========
  // LANGUAGES
  // =========

  setLanguage(langId: string) {
    this.language.set(langId)
    localStorage.setItem('language', JSON.stringify(this.language()));
  }

  initLanguage() {
    const memorizedLanguage = localStorage.getItem('language');
    return memorizedLanguage ? JSON.parse(memorizedLanguage) : environment.defaultLanguage;
  }

  getLanguage() {
    return this.language.asReadonly()
  }

  async getLanguages() {
    return await this.get<ShowLanguage[]>(`https://api.themoviedb.org/3/configuration/languages`)
  }

  // =================
  // SINGLE SHOW INFOS
  // =================

  async getInfoShow(showId: number, type: ShowTypeEnum): Promise<ShowDetails> {
    return type === ShowTypeEnum.MOVIES ? this.getInfoMovie(showId) : this.getInfoTvSeries(showId)
  }

  async getInfoMovie(showId: number): Promise<ShowDetails> {
    const showDetails = await this.get<ShowDetails>(`https://api.themoviedb.org/3/movie/${showId}`);
    showDetails.id = this.castNumber(showDetails.id.toString())!
    if (this.language()) {
      showDetails.translations = await this.get<ShowTranslationsList>(`https://api.themoviedb.org/3/movie/${showId}/translations`);
    }
    return showDetails;
  }

  async getInfoTvSeries(showId: number): Promise<ShowDetails> {
    const showDetails = await this.get<ShowDetails>(`https://api.themoviedb.org/3/tv/${showId}`);
    showDetails.id = this.castNumber(showDetails.id.toString())!
    if (this.language()) {
      showDetails.translations = await this.get<ShowTranslationsList>(`https://api.themoviedb.org/3/tv/${showId}/translations`);
    }
    return showDetails;
  }

  // ===========
  // SHOWS LISTS
  // ===========

  async search(textSearch: string): Promise<ShowResultsList> {
    const params = new URLSearchParams();
    params.append("query", textSearch);
    params.append("include_adult", true.toString());
    return await this.get<ShowResultsList>(`https://api.themoviedb.org/3/search/multi?${params}`);
  }

  async getShowsFromCategory(link: string, type: ShowTypeEnum) {
    const categoryShows = await this.get<ShowResultsList>(`https://api.themoviedb.org/3/${link}`);
    return categoryShows.results.map(cs => {
      return {
        id: cs.id,
        type: type,
        item: cs
      } as ShowReference
    });
  }

  async getShowListDetails(continueShows: UserListItem[]) {
    const detailedShows = continueShows.map(async cs => {
      return {
        id: cs.id,
        type: cs.type,
        time: cs.currentTime,
        season: cs.season,
        episode: cs.episode,
        details: await this.getInfoShow(cs.id, cs.type)
      } as ShowReference
    });

    return await Promise.all(detailedShows);
  }

  // =====
  // UTILS
  // =====

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
      console.error('Error while retrieving data: ', e);
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

  private castNumber(number: string | null | undefined) {
    return !number || Number.isNaN(Number.parseInt(number)) ? undefined : Number.parseInt(number);
  }
}
