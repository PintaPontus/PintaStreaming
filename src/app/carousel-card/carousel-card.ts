import {Component, Input} from '@angular/core';
import {MatCard, MatCardImage} from "@angular/material/card";
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {ShowResultItem, ShowTypeEnum} from '../../interfaces/show';

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
  @Input() show!: ShowResultItem;
  @Input() type!: ShowTypeEnum;
  @Input() isAvailable!: boolean;

  getPlayerLink(id: number) {
    if (this.type === ShowTypeEnum.TV_SERIES) {
      return `/player/${this.type}/${id}/1/1`;
    }
    return `/player/${this.type}/${id}`;
  }
}
