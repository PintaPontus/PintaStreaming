export enum ShowTypeEnum {
  MOVIES = 'movies',
  TV_SERIES = 'tv-series',
}

// SHOW REFERENCE

export interface ShowReference {
  id: number,
  type: ShowTypeEnum
  season?: number,
  episode?: number,
  time?: number,
  details?: ShowDetails,
  item?: ShowResultItem
}

export interface ShowDetails {
  adult: boolean;
  id: number;
  title: string;
  name: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date: string;
  last_air_date: string;
  production_companies: ShowCompany[];
  genres: ShowGenre[];
  seasons: undefined | ShowSeason[]
  translations: ShowTranslationsList | undefined;
}

export interface ShowGenre {
  id: number,
  name: string
}

export interface ShowTranslationsList {
  "id": number,
  "translations": ShowTranslation[]
}

export interface ShowTranslation {
  iso_3166_1: string,
  iso_639_1: string,
  name: string,
  english_name: string,
  data: {
    title: string,
    overview: string,
  }
}

export interface ShowCompany {
  id: number,
  logo_path: string,
  name: string,
  origin_country: string,
}

export interface ShowSeason {
  id: number,
  air_date: string,
  episode_count: number,
  name: string,
  season_number: number,
  overview: string,
}

// SHOW SEARCH RESULTS

export interface ShowResultsList {
  results: ShowResultItem[];
  page: number;
  total_results: number;
  total_pages: number;
}

export interface ShowResultItem {
  id: number;
  title: string;
  name: string;
  original_title: string;
  poster_path: string;
  adult: boolean;
  overview: string;
  vote_average: number;
  media_type: string;
}

// AVAILABLE SHOWS TO STREAM

export interface ShowResourceLibrary {
  date: Date;
  movies: ShowResource[];
  tvSeries: ShowResource[];
}

export interface ShowResource {
  tmdb_id: number;
}

// LANGUAGES

export interface ShowLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}
