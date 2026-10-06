import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {
  SearchType,
  ShowDetails,
  ShowLanguage,
  ShowProvidersList,
  ShowRecommendationList,
  ShowReference,
  ShowResultsList,
  ShowTypeEnum
} from '../interfaces/show';
import {environment} from '../environments/environment';
import {UserListItem} from '../interfaces/users';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class MovieDBService {

  private readonly httpService = inject(HttpService);

  private readonly language: WritableSignal<string> = signal(this.initLanguage());

  // =========
  // LANGUAGES
  // =========

  setLanguage(langId: string) {
    this.language.set(langId)
    localStorage.setItem('language', this.language());
  }

  initLanguage() {
    const memorizedLanguage = localStorage.getItem('language') || environment.defaultLanguage;
    if (memorizedLanguage?.length > 2) {
      return environment.defaultLanguage;
    }
    return memorizedLanguage;
  }

  getLanguage() {
    return this.language.asReadonly()
  }

  async getLanguages() {
    return await this.get<ShowLanguage[]>(`${environment.movieDBDomain}/3/configuration/languages`)
  }

  // =================
  // SINGLE SHOW INFOS
  // =================

  async getInfoShow(showId: number, type: ShowTypeEnum): Promise<ShowDetails> {
    return type === ShowTypeEnum.MOVIES ? this.getInfoMovie(showId) : this.getInfoTvSeries(showId)
  }

  async getInfoMovie(showId: number, abortSignal?: AbortSignal): Promise<ShowDetails> {
    const params = new URLSearchParams();
    params.append("language", this.language());
    const showDetails = await this.get<ShowDetails>(`${environment.movieDBDomain}/3/movie/${showId}?${params}`, abortSignal);
    showDetails.id = this.castNumber(showDetails.id.toString())!;
    return showDetails;
  }

  async getInfoTvSeries(showId: number, abortSignal?: AbortSignal): Promise<ShowDetails> {
    const params = new URLSearchParams();
    params.append("language", this.language());
    const showDetails = await this.get<ShowDetails>(`${environment.movieDBDomain}/3/tv/${showId}?${params}`, abortSignal);
    showDetails.id = this.castNumber(showDetails.id.toString())!;
    return showDetails;
  }

  async getProvidersMovie(showId: number): Promise<ShowProvidersList> {
    return await this.get<ShowProvidersList>(`${environment.movieDBDomain}/3/movie/${showId}/watch/providers`);
  }

  async getProvidersTvSeries(showId: number): Promise<ShowProvidersList> {
    return await this.get<ShowProvidersList>(`${environment.movieDBDomain}/3/tv/${showId}/watch/providers`);
  }

  // ===========
  // SHOWS LISTS
  // ===========

  async search(textSearch: string, type: SearchType, page?: number, abortSignal?: AbortSignal): Promise<ShowResultsList> {
    const params = new URLSearchParams();
    params.append("query", textSearch);
    params.append("include_adult", true.toString());
    params.append("language", this.language());
    if (page) {
      params.append("page", page.toString());
    }
    let searchUrl = `${environment.movieDBDomain}/3/search/multi?${params}`;
    if (type) {
      searchUrl = `${environment.movieDBDomain}/3/search/${type}?${params}`;
    }
    console.log(searchUrl);
    console.log(type);
    return await this.get<ShowResultsList>(searchUrl, abortSignal);
  }

  async getShowsFromCategory(link: string, type: ShowTypeEnum) {
    const params = new URLSearchParams();
    params.append("language", this.language());
    const categoryShows = await this.get<ShowResultsList>(`${environment.movieDBDomain}/3/${link}?${params}`);
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
        currentTime: cs.currentTime,
        duration: cs.duration,
        season: cs.season,
        episode: cs.episode,
        details: await this.getInfoShow(cs.id, cs.type)
      } as ShowReference
    });

    return await Promise.all(detailedShows);
  }

  async loadRecommendationsMovie(id: number) {
    const params = new URLSearchParams();
    params.append("language", this.language());
    return await this.get<ShowRecommendationList>(`${environment.movieDBDomain}/3/movie/${id}/recommendations?${params}`);
  }

  async loadRecommendationsTvSeries(id: number) {
    const params = new URLSearchParams();
    params.append("language", this.language());
    return await this.get<ShowRecommendationList>(`${environment.movieDBDomain}/3/tv/${id}/recommendations?${params}`);
  }

  // =====
  // UTILS
  // =====

  private get<T>(url: string, abortSignal?: AbortSignal): Promise<T> {
    return this.httpService.get<T>(url, this.getAuthHeader(), abortSignal);
  }

  private getAuthHeader() {
    return {
      'Authorization': `Bearer ${(environment.movieDBKey)}`
    };
  }

  private castNumber(number: string | null | undefined) {
    return !number || Number.isNaN(Number.parseInt(number)) ? undefined : Number.parseInt(number);
  }
}
