import {Component, computed, inject, input, InputSignal} from '@angular/core';
import {ShowTypeEnum} from '../../interfaces/show';
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

  showId = input(0);
  showType = input(ShowTypeEnum.MOVIES, {
    transform: (value: string | ShowTypeEnum) => {
      if (Object.values(ShowTypeEnum).includes(value as ShowTypeEnum)) {
        return value as ShowTypeEnum;
      } else if (value === "tv") {
        return ShowTypeEnum.TV_SERIES;
      }
      return ShowTypeEnum.MOVIES;
    }
  });
  showTitle: InputSignal<string | undefined> = input();
  showPosterPath: InputSignal<string | undefined> = input();
  isAvailable = computed(() => this.streamService.isAvailable(this.showId(), this.showType()));

  private streamService = inject(StreamService);

  playerLink = computed(() => {
    if (this.showType() === ShowTypeEnum.TV_SERIES) {
      return `/player/${ShowTypeEnum.TV_SERIES}/${this.showId()}/1/1`;
    }
    return `/player/${ShowTypeEnum.MOVIES}/${this.showId()}`;
  });

}
