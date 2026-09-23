import {computed, inject, Injectable, resource} from '@angular/core';
import {FirebaseService} from './firebase.service';
import {ShowTypeEnum} from '../interfaces/show';
import {HttpService} from './http.service';
import {VideoDomain} from '../interfaces/secrets';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  private httpService = inject(HttpService);
  private firebaseService = inject(FirebaseService);

  private readonly videoStreamingDomain = resource({
    loader: async () => {
      return (await this.httpService.get<VideoDomain>(`/api/video-streaming-domain`)).domain;
    }
  })

  private readonly showsLists = resource({
    loader: async () => {
      return await this.firebaseService.fetchShows();
    }
  })

  readonly movies = computed(() => this.showsLists.value()?.movies || []);
  readonly tvSeries = computed(() => this.showsLists.value()?.tvSeries || []);

  private readonly moviesSet = computed(() => {
    return new Set(this.movies().map(s => s.tmdb_id))
  });
  private readonly tvSeriesSet = computed(() => {
    return new Set(this.tvSeries().map(s => s.tmdb_id))
  });

  getVideoStreamingDomain() {
    return this.videoStreamingDomain.value.asReadonly();
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
    this.showsLists.reload();
  }

}
