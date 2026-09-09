import {Component, computed, inject, input, InputSignal} from '@angular/core';
import {MatCard, MatCardImage} from "@angular/material/card";
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {ShowReference, ShowTypeEnum} from '../../interfaces/show';
import {MatIconButton} from '@angular/material/button';
import {UserListItem, UserListTypeEnum} from '../../interfaces/users';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {FirebaseService} from '../firebase.service';
import {StreamService} from '../stream.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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

  private readonly firebaseService = inject(FirebaseService);
  private readonly streamService = inject(StreamService);
  private readonly snackBar = inject(MatSnackBar);

  readonly show: InputSignal<ShowReference | undefined> = input();
  readonly isAvailable = computed(() => {
    const showSnap = this.show();
    return this.listType() !== UserListTypeEnum.SUGGESTIONS
      || (!!showSnap && this.streamService.isAvailable(showSnap.id, showSnap.type))
  });
  readonly listType = input(UserListTypeEnum.SUGGESTIONS);
  readonly playerLink = computed(() => {
    if (this.show()?.type === ShowTypeEnum.TV_SERIES) {
      return `/player/${ShowTypeEnum.TV_SERIES}/${this.show()?.id}/${this.show()?.season || 1}/${this.show()?.episode || 1}`;
    }
    return `/player/${ShowTypeEnum.MOVIES}/${this.show()?.id}`;
  });
  readonly playerParams = computed(() => {
    return {
      "time": this.show()?.currentTime
    };
  });
  readonly showTitle = computed(() => {
    return this.show()?.details?.title
      || this.show()?.details?.name
      || this.show()?.details?.original_title
      || this.show()?.item?.title
      || this.show()?.item?.name
      || this.show()?.item?.original_title;
  });
  readonly watchProgress = computed(() => {
    const currentTime = this.show()?.currentTime;
    const duration = this.show()?.duration;
    if (!currentTime || !duration) {
      return 0;
    }
    const progress = (currentTime / duration) * 100;
    const steppedProgress = Math.ceil(progress / 5) * 5;
    return Math.max(5, Math.min(100, steppedProgress));
  });
  readonly showPosterPath = computed(() => {
    return this.show()?.details?.poster_path
      || this.show()?.item?.poster_path;
  });

  removeFromContinue() {
    this.firebaseService.removeContinueToWatch({
      id: this.show()!.id,
      type: this.show()!.type
    } as UserListItem)
      .then(_ => this.snackBar.open('Rimosso con successo', 'OK'));
  }

  removeFromFavorites() {
    this.firebaseService.toggleToFavorite({
      id: this.show()!.id,
      type: this.show()!.type
    } as UserListItem)
      .then(_ => this.snackBar.open('Rimosso con successo', 'OK'));
  }

  protected readonly ShowTypeEnum = ShowTypeEnum;
}
