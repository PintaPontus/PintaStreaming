import {ShowTypeEnum} from './show';

export interface UsersDetails {
  role: string;
  continueToWatch: UserListItem[];
  favorites: UserListItem[];
}

export interface UserListItem {
  id: number;
  type: ShowTypeEnum;
  currentTime: number;
  lastUpdate: number;
  season?: number;
  episode?: number;
}
