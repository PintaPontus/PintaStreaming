import {Component, computed, inject, input, InputSignal, OnInit, signal, WritableSignal} from '@angular/core';
import {
  MatCard,
  MatCardActions,
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
    PlayerCardInfo
  ],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css'
})
export class PlayerCard implements OnInit {

  videoUrl: InputSignal<SafeResourceUrl | undefined> = input();
  infoUrl: WritableSignal<SafeResourceUrl | undefined> = signal(undefined);
  currentSeason = input(1);
  currentSeasonInfo = computed(() =>
    this.seasons().find(s => s.season_number === this.currentSeason())
  );
  showInfo = input({} as ShowDetails);
  seasons = computed(() => this.showInfo().seasons || []);
  showType = input(ShowTypeEnum.MOVIES);
  private readonly route = inject(ActivatedRoute);
  private readonly movieDBService = inject(MovieDBService);
  language = this.movieDBService.getLanguage();
  showTranslation = computed(() => {
    const language = this.language() || 'en';
    return this.showInfo().translations?.translations.find(t =>
      t.iso_639_1 === language
    )
  });
  private readonly firebaseService = inject(FirebaseService);
  userInfos = this.firebaseService.getUserInfosDetails();
  isFavorite = computed(() => {
    return !!(this.userInfos()?.favorites || [])
      .find(f =>
        f.id === this.showInfo().id
        && f.type === this.showType()
      )
  });
  private readonly sanitizer = inject(DomSanitizer);
  cardTitle = computed(() => {
    return this.showTranslation()?.data.title
      || this.showInfo().title
      || this.showInfo().name
      || this.showInfo().original_title;
  });
  cardSubtitle = computed(() => {
    let showYear = (
      this.showInfo().release_date
      || this.showInfo().first_air_date
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

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      if (this.showType() === ShowTypeEnum.MOVIES) {
        await this.setupMoviePlayer(showID);
      }
      if (this.showType() === ShowTypeEnum.TV_SERIES) {
        await this.setupTvSeriesPlayer(showID);
      }
    });
  }

  // ====================
  // SHOW DETAILS ACTIONS
  // ====================

  // TODO: IMPLEMENT LIST
  // addShowToList() {
  //
  // }

  toggleShowToFavorites() {
    this.firebaseService.toggleToFavorite({
      id: this.showInfo().id,
      type: this.showType(),
      lastUpdate: Date.now()
    } as UserListItem)
  }

  // ========
  // PRIVATES
  // ========

  private async setupMoviePlayer(showID: number) {
    this.infoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.themoviedb.org/movie/${showID}`
      )
    );
  }

  private async setupTvSeriesPlayer(showID: number) {
    this.infoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.themoviedb.org/tv/${showID}`
      )
    );
  }

}
