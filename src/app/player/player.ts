import {afterNextRender, Component, computed, effect, inject, resource, Signal} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, SafeResourceUrl, Title} from '@angular/platform-browser';
import {ShowDetails, ShowTime, ShowTypeEnum} from '../../interfaces/show';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {toSignal} from '@angular/core/rxjs-interop';
import {PlayerRouteInfo} from '../../interfaces/routesInfo';
import {PlayerEvent, PlayerEventData} from '../../interfaces/playerEvents';
import {FirebaseService} from '../firebase.service';
import {UserListItem} from '../../interfaces/users';
import {PlayerCard} from '../player-card/player-card';
import {environment} from '../../environments/environment';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-player',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle,
    PlayerCard,
    MatProgressSpinner,
  ],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player {

  private readonly route = inject(ActivatedRoute);
  private readonly movieDBService = inject(MovieDBService);
  language = this.movieDBService.getLanguage();
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);
  routeData = toSignal(this.route.data) as Signal<PlayerRouteInfo>;
  routeParamMap = toSignal(this.route.paramMap) as Signal<ParamMap>;
  checkpointTimeoutFlag = false
  videoUrl: Signal<SafeResourceUrl | undefined> = computed(() => {
    if (!!this.showId() && this.routeData().type === ShowTypeEnum.MOVIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/movie/${this.showId()}?${this.getPlayerURLParams()}`
      )
    }
    if (!!this.showId() && this.routeData().type === ShowTypeEnum.TV_SERIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/tv/${this.showId()}/${(this.currentSeason())}/${this.currentEpisode()}?${this.getPlayerURLParams()}`
      )
    }
    return undefined;
  });
  episodes = computed(() => {
    const currentSeasonInfo = this.getCurrentSeason()
    return currentSeasonInfo?.episode_count
      ? Array.from(
        {length: currentSeasonInfo.episode_count},
        (_, i) => i + 1
      ).map(i => ({id: i}))
      : [];
  });
  currentSeason: Signal<number> = computed(() => {
    return this.routeParamMap().get('id') ? Number.parseInt(this.routeParamMap().get('id')!) : 1;
  });
  currentEpisode: Signal<number> = computed(() => {
    return this.routeParamMap().get('id') ? Number.parseInt(this.routeParamMap().get('id')!) : 1;
  });
  showId: Signal<number | undefined> = computed(() => {
    return this.routeParamMap().get('id') ? Number.parseInt(this.routeParamMap().get('id')!) : undefined;
  });
  protected readonly showInfo = resource({
    params: () => {
      const newId = this.showId()
      const newType = this.routeData().type
      if (!newId || !newType) {
        return undefined;
      }
      return {id: newId, type: newType}
    },
    loader: ({params, abortSignal}) => {
      if (params.type === ShowTypeEnum.MOVIES) {
        return this.movieDBService.getInfoMovie(params.id, abortSignal)
      }
      if (params.type === ShowTypeEnum.TV_SERIES) {
        return this.movieDBService.getInfoTvSeries(params.id, abortSignal)
      }
      return Promise.resolve({} as ShowDetails);
    },
    defaultValue: {} as ShowDetails
  });
  seasons = computed(() => this.showInfo.value().seasons || []);

  constructor() {
    effect(() => {
      if (this.routeData().type === ShowTypeEnum.TV_SERIES) {
        const paramSeason = this.castNumber(this.routeParamMap().get('season'));
        const paramEpisode = this.castNumber(this.routeParamMap().get('episode'));
        if (!paramSeason || !paramEpisode) {
          console.error("No season or episode");
          this.router.navigate(['/player/tv-series', this.showId(), paramSeason || 1, paramEpisode || 1]);
        }
      }
      const showInfo = this.showInfo.value();
      this.title.setTitle('PintaStreaming - ' + (showInfo.title || showInfo.name || showInfo.original_title))
    });
    afterNextRender(() => this.listenPlayerEvents())
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
    this.router.navigate(['/player/tv-series', this.showInfo.value().id, id, finalEpisode]);
  }

  goToSelectedEpisode(id: number) {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo.value().id, this.currentSeason(), id]);
  }

  // =============
  // PLAYER EVENTS
  // =============

  private listenPlayerEvents() {
    window?.addEventListener('message', (event) => {
      if (event.origin !== environment.videoStreamingDomain) {
        return;
      }
      const plEvent = event.data as PlayerEvent;
      switch (plEvent.event.event) {
        case "ended":
          this.handleEndedEvent();
          break;
        case "timeupdate":
          this.handleTimeUpdateEvent(plEvent.event);
          break;
      }
    });
  }

  private async handleEndedEvent() {
    this.firebaseService.removeContinueToWatch(this.createWatchCheckpoint())
  }

  private handleTimeUpdateEvent(plEvent: PlayerEventData) {
    this.updateTimeSession(plEvent.currentTime);
    if (this.checkpointTimeoutFlag) {
      return;
    }
    this.checkpointTimeoutFlag = true;
    setTimeout(() => this.checkpointTimeoutFlag = false, 60000);
    this.firebaseService.addToContinueToWatch(this.createWatchCheckpoint(plEvent.currentTime, plEvent.duration));
  }

  private updateTimeSession(time: number) {
    const checkpoint = {
      time: time,
      showId: this.showId(),
      type: this.routeData().type,
    } as ShowTime;
    if (this.routeData().type === ShowTypeEnum.TV_SERIES) {
      checkpoint.season = this.currentSeason();
      checkpoint.episode = this.currentEpisode();
    }
    sessionStorage.setItem("checkpoint", JSON.stringify(checkpoint));
  }

  private createWatchCheckpoint(currentTime?: number, duration?: number) {
    return {
      id: this.showId(),
      type: this.routeData().type,
      currentTime: currentTime,
      duration: duration,
      season: this.currentSeason(),
      episode: this.currentEpisode(),
      lastUpdate: Date.now(),
    } as UserListItem;
  }

  // ========
  // PRIVATES
  // ========

  private getPlayerURLParams() {
    const startTimeSession = JSON.parse(sessionStorage.getItem("checkpoint") || "{}") as ShowTime
    const startTimeParam = this.castNumber(this.route.snapshot.queryParamMap.get("time"))
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    urlParams.append("autoplay", "false")
    if (
      startTimeSession.time
      && startTimeSession.showId === this.showId()
      && startTimeSession.type === this.routeData().type
      && (
        startTimeSession.type !== ShowTypeEnum.TV_SERIES
        || (
          startTimeSession.season === this.currentSeason()
          && startTimeSession.episode === this.currentEpisode()))
    ) {
      urlParams.append("startAt", startTimeSession.time.toString())
    } else if (startTimeParam) {
      urlParams.append("startAt", startTimeParam.toString())
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
