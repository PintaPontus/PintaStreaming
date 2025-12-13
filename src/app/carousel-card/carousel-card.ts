import {Component, computed, inject, input, InputSignal} from '@angular/core';
import {MatCard, MatCardImage} from "@angular/material/card";
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {ShowReference, ShowTypeEnum} from '../../interfaces/show';
import {MatIconButton} from '@angular/material/button';
import {UserListItem, UserListTypeEnum} from '../../interfaces/users';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {FirebaseService} from '../firebase.service';

@Component({
  selector: 'app-carousel-card',
  imports: [
    MatCard,
    MatCardImage,
    MatTooltip,
    RouterLink,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './carousel-card.html',
  styleUrl: './carousel-card.css'
})
export class CarouselCard {

  protected readonly UserListTypeEnum = UserListTypeEnum;

  show: InputSignal<ShowReference | undefined> = input();
  isAvailable: InputSignal<boolean> = input(true);
  listType = input(UserListTypeEnum.SUGGESTIONS);

  private firebaseService = inject(FirebaseService);

  playerLink = computed(() => {
    if (this.show()?.type === ShowTypeEnum.TV_SERIES) {
      return `/player/${ShowTypeEnum.TV_SERIES}/${this.show()?.id}/${this.show()?.season || 1}/${this.show()?.episode || 1}`;
    }
    return `/player/${ShowTypeEnum.MOVIES}/${this.show()?.id}`;
  });

  playerParams = computed(() => {
    return {
      "time": this.show()?.time
    };
  });

  showTitle = computed(() => {
    return this.show()?.details?.title
      || this.show()?.details?.name
      || this.show()?.details?.original_title
      || this.show()?.item?.title
      || this.show()?.item?.name
      || this.show()?.item?.original_title;
  });

  showPosterPath = computed(() => {
    return this.show()?.details?.poster_path
      || this.show()?.item?.poster_path;
  });

  removeFromContinue() {
    this.firebaseService.removeContinueToWatch({
      id: this.show()!.id,
      type: this.show()!.type
    } as UserListItem);
  }

  removeFromFavorites() {
    this.firebaseService.toggleToFavorite({
      id: this.show()!.id,
      type: this.show()!.type
    } as UserListItem);
  }

}
