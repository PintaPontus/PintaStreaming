import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FirebaseService} from './firebase.service';
import {ShowResource, ShowTypeEnum} from '../interfaces/show';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  private firebaseService = inject(FirebaseService);
  private movies: WritableSignal<ShowResource[]> = signal([]);
  private tvSeries: WritableSignal<ShowResource[]> = signal([]);

  private moviesSet: Signal<number[]> = computed(() => {
    return new Set(this.movies().map(s => s.tmdb_id))
  });
  private tvSeriesSet: Signal<number[]> = computed(() => {
    return new Set(this.tvSeries().map(s => s.tmdb_id))
  });

  constructor() {
    this.fetchShows();
  }

  getMovies() {
    return this.movies.asReadonly();
  }

  getTvSeries() {
    return this.tvSeries.asReadonly();
  }

  isAvailable(id: number, type: ShowTypeEnum) {
    if (type === ShowTypeEnum.MOVIES) {
      return this.moviesSet().has(id);
    } else if (type === ShowTypeEnum.TV_SERIES) {
      return this.tvSeriesSet().has(id);
    }
    return false;
  }

  async refreshShows() {
    await this.fetchShows();
  }

  private async fetchShows() {
    const showsList = await this.firebaseService.fetchShows();
    this.movies.set(showsList.movies);
    this.tvSeries.set(showsList.tvSeries);
  }

}
