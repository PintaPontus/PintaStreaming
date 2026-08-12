import {Component, computed, effect, inject, input, InputSignal, signal} from '@angular/core';
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
    RecommendationCard
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
  showRecommendations = signal({} as ShowRecommendationList);
  openedRecommendations = signal(false);
  private movieDbService = inject(MovieDBService);

  constructor() {
    effect(() => {
      console.log("Effect");
      const id = this.showInfo().id;
      if (id) {
        this.showRecommendations.set({} as ShowRecommendationList);
        if (this.openedRecommendations()) {
          this.loadCorrelates();
        }
      }
    });
  }

  async openRecommendations() {
    console.log("Opening recommendations");
    this.openedRecommendations.set(true);
  }

  async loadCorrelates() {
    if (this.showType() === ShowTypeEnum.MOVIES) {
      this.showRecommendations.set(
        await this.movieDbService.loadRecommendationsMovie(this.showInfo().id)
      )
    } else if (this.showType() === ShowTypeEnum.TV_SERIES) {
      this.showRecommendations.set(
        await this.movieDbService.loadRecommendationsTvSeries(this.showInfo().id)
      )
    }
  }
}
