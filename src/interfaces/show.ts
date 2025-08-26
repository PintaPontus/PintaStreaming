export interface ShowDetails {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
}

export interface ShowSearchList{
  results: ShowSearchItem[];
  page: number;
}

export interface ShowSearchItem{
  id: string;
  title: string;
  name: string;
  original_title: string;
  poster_path: string;
  adult: boolean;
  overview: string;
  vote_average: number;
}
