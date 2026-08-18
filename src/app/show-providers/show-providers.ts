import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {ShowProvidersList, ShowProvidersLocale, ShowTypeEnum} from '../../interfaces/show';
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

  showId = input<number | undefined>(undefined);
  showType = input(ShowTypeEnum.MOVIES);
  language = this.movieDBService.getLanguage();
  showProviders = signal<ShowProvidersList | undefined>(undefined);
  showProvidersLocale = computed<ShowProvidersLocale | undefined>(() =>
    this.showProviders()?.results?.[this.language().toUpperCase()]
  );

  constructor() {
    effect(async () => {
      const showId = this.showId();
      if (showId !== undefined) {
        if (this.showType() === ShowTypeEnum.MOVIES) {
          this.showProviders.set(await this.movieDBService.getProvidersMovie(showId));
        }
        if (this.showType() === ShowTypeEnum.TV_SERIES) {
          this.showProviders.set(await this.movieDBService.getProvidersTvSeries(showId));
        }
      }
    });
  }
}
