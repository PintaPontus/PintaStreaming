import {Component, computed, inject, input, resource} from '@angular/core';
import {ShowProvidersLocale, ShowTypeEnum} from '../../interfaces/show';
import {MatTooltip} from '@angular/material/tooltip';
import {MovieDBService} from '../movie-db.service';

@Component({
  selector: 'app-show-providers',
  imports: [
    MatTooltip
  ],
  templateUrl: './show-providers.html',
  styleUrl: './show-providers.css'
})
export class ShowProviders {

  private readonly movieDBService = inject(MovieDBService);

  readonly showId = input<number | undefined>(undefined);
  readonly showType = input(ShowTypeEnum.MOVIES);
  readonly language = this.movieDBService.getLanguage();
  readonly showProviders = resource({
    params: () => ({showId: this.showId(), showType: this.showType()}),
    loader: async ({params}) => {
      if (params.showId !== undefined) {
        if (params.showType === ShowTypeEnum.MOVIES) {
          return await this.movieDBService.getProvidersMovie(params.showId);
        }
        if (params.showType === ShowTypeEnum.TV_SERIES) {
          return await this.movieDBService.getProvidersTvSeries(params.showId);
        }
      }
      return;
    },
  });
  readonly showProvidersLocale = computed<ShowProvidersLocale | undefined>(() =>
    this.showProviders.value()?.results?.[this.language().toUpperCase()]
  );

}
