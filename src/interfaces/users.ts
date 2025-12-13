import {ShowTypeEnum} from './show';

export interface UsersDetails {
  role: string;
  continueToWatch: UserListItem[];
  favorites: UserListItem[];
}

export enum UserListTypeEnum {
  CONTINUE = 'continueToWatch',
  FAVORITES = 'favorites',
  CUSTOM_LIST = 'customList',
  SUGGESTIONS = 'suggestions',
}

export interface UserListItem {
  id: number;
  type: ShowTypeEnum;
  currentTime: number;
  lastUpdate: number;
  season?: number;
  episode?: number;
}
