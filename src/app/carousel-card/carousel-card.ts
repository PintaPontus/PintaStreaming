import {Component, Input} from '@angular/core';
import {MatCard, MatCardImage} from "@angular/material/card";
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {ShowReference, ShowTypeEnum} from '../../interfaces/show';

@Component({
  selector: 'app-carousel-card',
  imports: [
    MatCard,
    MatCardImage,
    MatTooltip,
    RouterLink
  ],
  templateUrl: './carousel-card.html',
  styleUrl: './carousel-card.css'
})
export class CarouselCard {
  @Input() show!: ShowReference;
  @Input() isAvailable!: boolean;

  getPlayerLink(id: number) {
    if (this.show.type === ShowTypeEnum.TV_SERIES) {
      return `/player/${this.show.type}/${id}/${this.show.season || 1}/${this.show.episode || 1}`;
    }
    return `/player/${this.show.type}/${id}`;
  }

  getPlayerParams() {
    return {
      "time": this.show.time
    }
  }

  getShowTitle() {
    return this.show.details?.title
      || this.show.details?.name
      || this.show.details?.original_title
      || this.show.item?.title
      || this.show.item?.name
      || this.show.item?.original_title;
  }

  getShowPosterPath() {
    return this.show.item?.poster_path
      || this.show.details?.poster_path
  }
}
