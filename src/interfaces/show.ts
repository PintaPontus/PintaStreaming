export enum ShowTypeEnum {
  MOVIES = 'movies',
  TV_SERIES = 'tv-series',
}

export interface ShowDetails {
  adult: boolean;
  id: string;
  title: string;
  name: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genres: ShowGenre[];
  seasons: undefined | ShowSeason[]
  translations: ShowTranslationsList;
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

export interface ShowSeason {
  id: number,
  air_date: string,
  episode_count: number,
  name: string,
  season_number: number,
  overview: string,
}


export interface ShowResultsList {
  results: ShowResultItem[];
  page: number;
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

export interface ShowResourceLibrary {
  date: Date;
  movies: ShowResource[];
  tvSeries: ShowResource[];
}

export interface ShowResource {
  tmdb_id: number;
}

export interface ShowLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}
