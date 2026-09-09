import {Component, computed, inject, input, InputSignal, Signal} from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from "@angular/material/card";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatDivider} from "@angular/material/divider";
import {ShowDetails, ShowTypeEnum} from '../../interfaces/show';
import {FirebaseService} from '../firebase.service';
import {MovieDBService} from '../movie-db.service';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {UserListItem} from '../../interfaces/users';
import {PlayerCardInfo} from '../player-card-info/player-card-info';
import {ShowProviders} from '../show-providers/show-providers';
import {MatTooltip} from '@angular/material/tooltip';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-player-card',
  imports: [
    MatCard,
    MatCardActions,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCardTitleGroup,
    MatChip,
    MatChipSet,
    MatDivider,
    PlayerCardInfo,
    MatCardContent,
    ShowProviders,
    MatTooltip
  ],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css'
})
export class PlayerCard {

  private readonly route = inject(ActivatedRoute);
  private readonly movieDBService = inject(MovieDBService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly firebaseService = inject(FirebaseService);

  readonly routeParamMap = toSignal(this.route.paramMap)

  readonly videoUrl: InputSignal<SafeResourceUrl | undefined> = input();
  readonly infoUrl: Signal<SafeResourceUrl | undefined> = computed(() => {
    const showIDSnap = this.showId();
    const showTypeSnap = this.showType()
    if (showIDSnap !== undefined) {
      if (showTypeSnap === ShowTypeEnum.MOVIES) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.themoviedb.org/movie/${showIDSnap}`
        );
      }
      if (showTypeSnap === ShowTypeEnum.TV_SERIES) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.themoviedb.org/tv/${showIDSnap}`
        );
      }
    }
    return;
  });
  readonly currentSeason = input(1);
  readonly currentSeasonInfo = computed(() =>
    this.seasons().find(s => s.season_number === this.currentSeason())
  );
  readonly showInfo = input<ShowDetails | undefined>({} as ShowDetails);
  readonly seasons = computed(() => this.showInfo()?.seasons || []);
  readonly showId = computed(() => {
    const idSnap = this.routeParamMap()?.get('id') ?? undefined
    return idSnap ? Number.parseInt(idSnap) : undefined
  });
  readonly showType = input(ShowTypeEnum.MOVIES);
  readonly language = this.movieDBService.getLanguage();
  readonly showTranslation = computed(() => {
    const language = this.language();
    return this.showInfo()?.translations?.translations.find(t =>
      t.iso_639_1 === language
    )
  });
  readonly userInfos = this.firebaseService.getUserInfosDetails();
  readonly isFavorite = computed(() => {
    return !!(this.userInfos()?.favorites || [])
      .find(f =>
        f.id === this.showInfo()?.id
        && f.type === this.showType()
      )
  });
  readonly cardTitle = computed(() => {
    return this.showTranslation()?.data.title
      || this.showInfo()?.title
      || this.showInfo()?.name
      || this.showInfo()?.original_title;
  });
  readonly cardSubtitle = computed(() => {
    let showYear = (
      this.showInfo()?.release_date
      || this.showInfo()?.first_air_date
    )?.split('-')[0];

    let showSeasonsCount

    if (this.showType() === ShowTypeEnum.TV_SERIES) {
      showSeasonsCount = `${this.seasons().length} Stagioni`
    } else {
      showSeasonsCount = 'Film'
    }

    return showYear
      ? `${showYear} - ${showSeasonsCount}`
      : `${showSeasonsCount}`;
  });

  // ====================
  // SHOW DETAILS ACTIONS
  // ====================

  // TODO: IMPLEMENT LIST
  // addShowToList() {
  //
  // }

  toggleShowToFavorites() {
    this.firebaseService.toggleToFavorite({
      id: this.showInfo()?.id,
      type: this.showType(),
      lastUpdate: Date.now()
    } as UserListItem)
  }

}
