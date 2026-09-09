import {Component, computed, inject, input, InputSignal, resource, signal} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {ShowDetails, ShowSeason, ShowTranslation, ShowTypeEnum} from '../../interfaces/show';
import {MovieDBService} from '../movie-db.service';
import {RecommendationCard} from '../recommendation-card/recommendation-card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-player-card-info',
  imports: [
    MatAccordion,
    MatChip,
    MatChipSet,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    RecommendationCard,
    MatProgressSpinner
  ],
  templateUrl: './player-card-info.html',
  styleUrl: './player-card-info.css'
})
export class PlayerCardInfo {

  private readonly movieDbService = inject(MovieDBService);

  readonly currentSeasonInfo: InputSignal<ShowSeason | undefined> = input();
  readonly showInfo = input<ShowDetails | undefined>({} as ShowDetails);
  readonly showType = input(ShowTypeEnum.MOVIES);
  readonly showTranslation: InputSignal<ShowTranslation | undefined> = input();
  readonly showCardOverview = computed(() => {
    return this.showTranslation()?.data.overview
      || this.showInfo()?.overview;
  });
  readonly showCardSeasonTitle = computed(() => {
    const currSeason = this.currentSeasonInfo();
    return currSeason?.name || ("Season " + currSeason?.season_number);
  });
  readonly openedRecommendations = signal(false);
  readonly recommendationsResource = resource({
    params: () => {
      const id = this.showInfo()?.id;
      if (!id || !this.openedRecommendations()) {
        return undefined;
      }
      return {id, type: this.showType()};
    },
    loader: async ({params}) => {
      if (params.type === ShowTypeEnum.MOVIES) {
        return this.movieDbService.loadRecommendationsMovie(params.id);
      } else if (params.type === ShowTypeEnum.TV_SERIES) {
        return this.movieDbService.loadRecommendationsTvSeries(params.id);
      }
      return;
    },
  });

  openRecommendations() {
    this.openedRecommendations.set(true);
  }

}
