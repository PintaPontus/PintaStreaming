import {Component, computed, inject, input} from '@angular/core';
import {ShowRecommendation, ShowTypeEnum} from '../../interfaces/show';
import {MatCard, MatCardImage} from '@angular/material/card';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {StreamService} from '../stream.service';

@Component({
  selector: 'app-recommendation-card',
  imports: [
    MatCard,
    MatCardImage,
    MatTooltip,
    RouterLink
  ],
  templateUrl: './recommendation-card.html',
  styleUrl: './recommendation-card.css'
})
export class RecommendationCard {

  recommendation = input({} as ShowRecommendation);
  showId = computed(() => this.recommendation().id);
  showType = computed(() => {
    const showType = this.recommendation().media_type
    if (Object.values(ShowTypeEnum).includes(showType as ShowTypeEnum)) {
      return showType as ShowTypeEnum;
    } else if (showType === "tv") {
      return ShowTypeEnum.TV_SERIES;
    }
    return ShowTypeEnum.MOVIES;
  });
  showTitle = computed(() => this.recommendation().title || this.recommendation().original_title);
  showPosterPath = computed(() => this.recommendation().poster_path);
  isAvailable = computed(() => this.streamService.isAvailable(this.showId(), this.showType()));

  private streamService = inject(StreamService);

  playerLink = computed(() => {
    if (this.showType() === ShowTypeEnum.TV_SERIES) {
      return `/player/${ShowTypeEnum.TV_SERIES}/${this.showId()}/1/1`;
    }
    return `/player/${ShowTypeEnum.MOVIES}/${this.showId()}`;
  });

}
