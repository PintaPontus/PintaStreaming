import {afterNextRender, Component, computed, DestroyRef, effect, inject, resource, Signal} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, SafeResourceUrl, Title} from '@angular/platform-browser';
import {ShowDetails, ShowTime, ShowTypeEnum} from '../../interfaces/show';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {PlayerRouteInfo} from '../../interfaces/routesInfo';
import {PlayerEvent, PlayerEventData} from '../../interfaces/playerEvents';
import {FirebaseService} from '../firebase.service';
import {UserListItem} from '../../interfaces/users';
import {PlayerCard} from '../player-card/player-card';
import {environment} from '../../environments/environment';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {fromEvent} from 'rxjs';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieDBService = inject(MovieDBService);
  language = this.movieDBService.getLanguage();
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);
  routeData = toSignal(this.route.data) as Signal<PlayerRouteInfo>;
  routeParamMap = toSignal(this.route.paramMap) as Signal<ParamMap>;
  routeQueryMap = toSignal(this.route.queryParamMap) as Signal<ParamMap>;
  checkpointTimeoutFlag = false
  videoUrl: Signal<SafeResourceUrl | undefined> = computed(() => {
    if (!!this.showId() && this.routeData().type === ShowTypeEnum.MOVIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/movie/${this.showId()}?${this.playerUrlParams()}`
      )
    }
    if (!!this.showId() && this.routeData().type === ShowTypeEnum.TV_SERIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/tv/${this.showId()}/${(this.currentSeason())}/${this.currentEpisode()}?${this.playerUrlParams()}`
      )
    }
    return undefined;
  });
  playerUrlParams = computed(() => {
    const startTimeSession = JSON.parse(sessionStorage.getItem("checkpoint") || "{}") as ShowTime
    const startTimeParam = this.castNumber(this.routeQueryMap().get("time"))
    const urlParams = new URLSearchParams()
    const rootElement = getComputedStyle(document.documentElement)
    const rawPrimary = rootElement.getPropertyValue('--mat-sys-primary');
    const rawSecondary = rootElement.getPropertyValue('--mat-sys-secondary');
    urlParams.append("primaryColor", this.pickFromLightDark(rawPrimary))
    urlParams.append("secondaryColor", this.pickFromLightDark(rawSecondary))
    urlParams.append("lang", this.language())
    urlParams.append("autoplay", "false")
    if (
      !!startTimeSession.time
      && startTimeSession.showId === this.showId()
      && startTimeSession.type === this.routeData().type
      && (
        startTimeSession.type !== ShowTypeEnum.TV_SERIES
        || (
          startTimeSession.season === this.currentSeason()
          && startTimeSession.episode === this.currentEpisode())
      )
    ) {
      urlParams.append("startAt", startTimeSession.time.toString())
    } else if (startTimeParam) {
      urlParams.append("startAt", startTimeParam.toString())
    }
    return urlParams;
  });
  episodes = computed(() => {
    const currentSeasonInfo = this.seasons().find(s => s.season_number === this.currentSeason())
    return currentSeasonInfo?.episode_count
      ? Array.from(
        {length: currentSeasonInfo.episode_count},
        (_, i) => i + 1
      ).map(i => ({id: i}))
      : [];
  });
  currentSeason: Signal<number> = computed(() => {
    return this.routeParamMap().get('season') ? Number.parseInt(this.routeParamMap().get('season')!) : 1;
  });
  currentEpisode: Signal<number> = computed(() => {
    return this.routeParamMap().get('episode') ? Number.parseInt(this.routeParamMap().get('episode')!) : 1;
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
    fromEvent<MessageEvent>(window, 'message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.origin !== environment.videoStreamingDomain) {
          return;
        }
        const plEvent = event.data as PlayerEvent;
        switch (plEvent.event.event) {
          case 'ended':
            this.handleEndedEvent();
            break;
          case 'timeupdate':
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

  private castNumber(number: string | null | undefined) {
    return !number || Number.isNaN(Number.parseInt(number)) ? undefined : Number.parseInt(number);
  }

  private pickFromLightDark(token: string): string {
    const match = token.trim().match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
    if (!match) return token.trim();

    // TODO: enable when fixed light dark issues
    // const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = true;
    const finalColor = isDark ? match[2] : match[1];
    return finalColor.replace("#", "");
  }

}
