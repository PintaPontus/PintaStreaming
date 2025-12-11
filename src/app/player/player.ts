import {ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {ShowDetails} from '../../interfaces/show';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {toSignal} from '@angular/core/rxjs-interop';
import {PlayerRouteInfo} from '../../interfaces/routesInfo';
import {PlayerEvents} from '../../interfaces/playerEvents';
import {FirebaseService} from '../firebase.service';
import {UserListItem} from '../../interfaces/users';

@Component({
  selector: 'app-player',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardSubtitle,
    MatCardTitleGroup,
    MatDivider,
    MatChipSet,
    MatChip,
    MatCardActions,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './player.html',
  styleUrl: './player.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Player implements OnInit {

  checkpointTimeoutFlag = false
  videoUrl = signal('');
  infoUrl = signal('');
  episodes = computed(() => {
    const currentSeasonInfo = this.getCurrentSeason()
    return currentSeasonInfo?.episode_count
      ? Array.from(
        {length: currentSeasonInfo.episode_count},
        (_, i) => i + 1
      ).map(i => ({id: i}))
      : [];
  });
  currentSeason = signal(1);
  currentEpisode = signal(1);
  showInfo = signal({} as ShowDetails);
  seasons = computed(() => this.showInfo().seasons || []);
  private readonly route = inject(ActivatedRoute);
  routeData = toSignal(this.route.data) as Signal<PlayerRouteInfo>;
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
        && f.type === this.routeData().type
      )
  });
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      const startTime = this.castNumber(this.route.snapshot.queryParamMap.get("time"))
      if (this.routeData().type === 'movies') {
        await this.setupMoviePlayer(showID, startTime);
      }
      if (this.routeData().type === 'tv-series') {
        const paramSeason = this.castNumber(params.get('season'));
        const paramEpisode = this.castNumber(params.get('episode'));
        if (!paramSeason || !paramEpisode) {
          console.error("No season or episode");
          await this.router.navigate(['/player/tv-series', showID, paramSeason || 1, paramSeason || 1]);
        }
        this.currentSeason.set(Number.parseInt(params.get('season')!));
        this.currentEpisode.set(Number.parseInt(params.get('episode')!));
        await this.setupTvSeriesPlayer(showID, startTime);
      }
    });
    this.listenPlayerEvents()
  }

  // ===============
  // SHOW CARD INFOS
  // ===============

  getShowCardTitle() {
    const showInfoSnap = this.showInfo();
    const showTransSnap = this.showTranslation();

    return showTransSnap?.data.title
      || showInfoSnap.title
      || showInfoSnap.name
      || showInfoSnap.original_title;
  }

  getShowCardSubtitle() {
    const showInfoSnap = this.showInfo();

    let showYear = (
      showInfoSnap.release_date
      || showInfoSnap.first_air_date
    )?.split('-')[0];

    let showSeasonsCount

    if (this.routeData().type === 'tv-series') {
      showSeasonsCount = `${this.seasons().length} Stagioni`
    } else {
      showSeasonsCount = 'Film'
    }

    return showYear
      ? `${showYear} - ${showSeasonsCount}`
      : `${showSeasonsCount}`;
  }

  getShowCardOverview() {
    return this.showTranslation()?.data.overview
      || this.showInfo().overview;
  }

  getShowCardCompanies() {
    return this.showInfo().production_companies
    // .map(c => c.name)
    // .join(', ');
  }

  getShowCardSeasonTitle() {
    const currSeason = this.getCurrentSeason();
    return currSeason?.name || ("Season " + currSeason?.season_number);
  }

  getShowCardSeasonDescription() {
    return this.getCurrentSeason()?.overview || "";
  }

  // ====================
  // SHOW DETAILS ACTIONS
  // ====================

  addShowToList() {

  }

  toggleShowToFavorites() {
    this.firebaseService.toggleToFavorite({
      id: this.showInfo().id,
      type: this.routeData().type,
      lastUpdate: Date.now()
    } as UserListItem)
  }

  getShowInfoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.infoUrl());
  }

  getVideoFrameUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl());
  }

  // ======================
  // SEASON EPISODE ACTIONS
  // ======================

  goToSelectedSeason(id: number) {
    let finalEpisode = this.currentEpisode();
    if (this.seasons().find(s => s.season_number === id)!.episode_count < finalEpisode) {
      finalEpisode = 1;
    }
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo().id, id, finalEpisode]);
  }

  goToSelectedEpisode(id: number) {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo().id, this.currentSeason(), id]);
  }

  // =============
  // PLAYER EVENTS
  // =============

  private listenPlayerEvents() {
    window?.addEventListener('message', (event) => {
      if (event.origin !== 'https://vixsrc.to') {
        return;
      }
      const plEvent = JSON.parse(event.data) as PlayerEvents;
      switch (plEvent.data.event) {
        case "ended":
          this.handleEndedEvent();
          break;
        case "timeupdate":
          this.handleTimeUpdateEvent(plEvent);
          break;
      }
    });
  }

  private async handleEndedEvent() {
    this.firebaseService.removeContinueToWatch(this.createWatchCheckpoint())
  }

  private handleTimeUpdateEvent(plEvent: PlayerEvents) {
    if (this.checkpointTimeoutFlag) {
      return;
    }
    this.checkpointTimeoutFlag = true;
    setTimeout(() => this.checkpointTimeoutFlag = false, 60000);
    this.firebaseService.addToContinueToWatch(this.createWatchCheckpoint(plEvent.data.currentTime));
  }

  private createWatchCheckpoint(currentTime?: number) {
    return {
      id: this.showInfo().id,
      type: this.routeData().type,
      currentTime: currentTime,
      season: this.currentSeason(),
      episode: this.currentEpisode(),
      lastUpdate: Date.now(),
    } as UserListItem;
  }

// ========
  // PRIVATES
  // ========

  private async setupMoviePlayer(showID: number, time?: number) {
    const newShowInfo = await this.movieDBService.getInfoMovie(showID);
    this.updateShowInfo(newShowInfo);
    this.videoUrl.set(`https://vixsrc.to/movie/${showID}?${this.getURLParams(time)}`);
    this.infoUrl.set(`https://www.themoviedb.org/movie/${showID}`);
  }

  private async setupTvSeriesPlayer(showID: number, time?: number) {
    const newShowInfo = await this.movieDBService.getInfoTvSeries(showID);
    this.updateShowInfo(newShowInfo);
    this.videoUrl.set(`https://vixsrc.to/tv/${showID}/${(this.currentSeason())}/${this.currentEpisode()}?${this.getURLParams(time)}`);
    this.infoUrl.set(`https://www.themoviedb.org/tv/${showID}`);
  }

  private updateShowInfo(showInfo: ShowDetails) {
    this.showInfo.set(showInfo);
    this.title.setTitle('PintaStreaming - ' + (showInfo.title || showInfo.name || showInfo.original_title));
  }

  private getURLParams(time?: number) {
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    if (time) {
      urlParams.append("startAt", time.toString())
    }
    return urlParams;
  }

  private getCurrentSeason() {
    return this.seasons().find(s => s.season_number === this.currentSeason())
  }

  private castNumber(number: string | null | undefined) {
    return !number || Number.isNaN(Number.parseInt(number)) ? undefined : Number.parseInt(number);
  }
}
