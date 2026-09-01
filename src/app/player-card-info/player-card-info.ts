import {Component, computed, inject, input, InputSignal, resource, signal} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {ShowDetails, ShowRecommendationList, ShowSeason, ShowTranslation, ShowTypeEnum} from '../../interfaces/show';
import {MovieDBService} from '../movie-db.service';
import {RecommendationCard} from '../recommendation-card/recommendation-card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

const DEFAULT_RECOMMENDATIONS = {} as ShowRecommendationList;

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

  currentSeasonInfo: InputSignal<ShowSeason | undefined> = input();
  showInfo = input({} as ShowDetails);
  showType = input(ShowTypeEnum.MOVIES);
  showTranslation: InputSignal<ShowTranslation | undefined> = input();
  showCardOverview = computed(() => {
    return this.showTranslation()?.data.overview
      || this.showInfo().overview;
  });
  showCardSeasonTitle = computed(() => {
    const currSeason = this.currentSeasonInfo();
    return currSeason?.name || ("Season " + currSeason?.season_number);
  });
  openedRecommendations = signal(false);
  private movieDbService = inject(MovieDBService);

  recommendationsResource = resource({
    params: () => {
      const id = this.showInfo().id;
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
      return DEFAULT_RECOMMENDATIONS;
    },
    defaultValue: DEFAULT_RECOMMENDATIONS
  });

  openRecommendations() {
    this.openedRecommendations.set(true);
  }

}
