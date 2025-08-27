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
  genres: [{
    id: number,
    name: string,
  }];
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

export interface CatalogCategory {
  title: string;
  link: string;
  type: ShowTypeEnum;
}
