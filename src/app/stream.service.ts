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

  private moviesArray: Signal<number[]> = computed(() => {
    return this.movies().map(s => s.tmdb_id)
  });
  private tvSeriesArray: Signal<number[]> = computed(() => {
    return this.tvSeries().map(s => s.tmdb_id)
  });

  async getMovies() {
    if (this.movies().length === 0 || this.tvSeries().length === 0) {
      await this.fetchShows()
    }
    return this.movies.asReadonly();
  }

  async getTvSeries() {
    if (this.movies().length === 0 || this.tvSeries().length === 0) {
      await this.fetchShows()
    }
    return this.tvSeries.asReadonly();
  }

  isAvailable(id: number, type: ShowTypeEnum) {
    if (type === ShowTypeEnum.MOVIES) {
      return this.moviesArray().includes(id);
    } else if (type === ShowTypeEnum.TV_SERIES) {
      return this.tvSeriesArray().includes(id);
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
