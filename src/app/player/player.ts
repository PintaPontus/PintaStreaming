import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  resource,
  Signal,
  viewChild
} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, SafeResourceUrl, Title} from '@angular/platform-browser';
import {ShowTime, ShowTypeEnum} from '../../interfaces/show';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {PlayerRouteInfo} from '../../interfaces/routesInfo';
import {PlayerEvent, PlayerEventData} from '../../interfaces/playerEvents';
import {FirebaseService} from '../firebase.service';
import {UserListItem} from '../../interfaces/users';
import {PlayerCard} from '../player-card/player-card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {fromEvent} from 'rxjs';
import {StreamService} from '../stream.service';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-player',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle,
    PlayerCard,
    MatProgressSpinner,
    MatButton,
    MatIcon,
  ],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player {

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieDBService = inject(MovieDBService);
  private readonly streamService = inject(StreamService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly routeData = toSignal(this.route.data) as Signal<PlayerRouteInfo>;
  private readonly routeParamMap = toSignal(this.route.paramMap) as Signal<ParamMap>;
  private readonly routeQueryMap = toSignal(this.route.queryParamMap) as Signal<ParamMap>;

  private readonly seasonWrapper = viewChild<ElementRef<HTMLElement>>('seasonWrapper');
  private readonly episodeWrapper = viewChild<ElementRef<HTMLElement>>('episodeWrapper');

  readonly type = computed(() => this.routeData().type)
  readonly language = this.movieDBService.getLanguage();
  readonly videoStreamingDomain = this.streamService.getVideoStreamingDomain();
  readonly videoUrl: Signal<SafeResourceUrl | undefined> = computed(() => {
    if (!!this.showId() && this.type() === ShowTypeEnum.MOVIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.videoStreamingDomain()}/movie/${this.showId()}?${this.playerUrlParams()}`
      )
    }
    if (!!this.showId() && this.type() === ShowTypeEnum.TV_SERIES) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.videoStreamingDomain()}/tv/${this.showId()}/${(this.currentSeason())}/${this.currentEpisode()}?${this.playerUrlParams()}`
      )
    }
    return undefined;
  });
  readonly autoplay: Signal<boolean> = computed(() => {
    return this.routeQueryMap().get('autoplay') ? this.routeQueryMap().get('autoplay') === "true" : false;
  });

  readonly playerUrlParams = computed(() => {
    const startTimeSession = JSON.parse(sessionStorage.getItem("checkpoint") || "{}") as ShowTime
    const startTimeParam = this.castNumber(this.routeQueryMap().get("time"))
    const urlParams = new URLSearchParams()
    const rootElement = getComputedStyle(document.documentElement)
    const rawPrimary = rootElement.getPropertyValue('--mat-sys-primary');
    const rawSecondary = rootElement.getPropertyValue('--mat-sys-secondary');
    urlParams.append("primaryColor", this.pickFromLightDark(rawPrimary))
    urlParams.append("secondaryColor", this.pickFromLightDark(rawSecondary))
    urlParams.append("lang", this.language())
    urlParams.append("autoplay", this.autoplay().toString())
    if (
      !!startTimeSession.time
      && startTimeSession.showId === this.showId()
      && startTimeSession.type === this.type()
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

  readonly currentSeason: Signal<number> = computed(() => {
    return this.routeParamMap().get('season') ? Number.parseInt(this.routeParamMap().get('season')!) : 1;
  });
  readonly currentEpisode: Signal<number> = computed(() => {
    return this.routeParamMap().get('episode') ? Number.parseInt(this.routeParamMap().get('episode')!) : 1;
  });

  readonly seasons = computed(() => this.showInfo.value()?.seasons || []);
  readonly currentSeasonInfo = computed(() => this.seasons().find(s => s.season_number === this.currentSeason()))
  readonly episodes = computed(() => {
    const currentSeasonInfo = this.currentSeasonInfo()
    return currentSeasonInfo?.episode_count
      ? Array.from(
        {length: currentSeasonInfo.episode_count},
        (_, i) => i + 1
      ).map(i => ({id: i}))
      : [];
  });
  readonly isFirstEpisode: Signal<boolean> = computed(() => {
    if (this.type() !== ShowTypeEnum.TV_SERIES) {
      return true;
    }
    return this.currentSeason() === this.seasons()[0]?.season_number
      && this.currentEpisode() === 1;
  });
  readonly isLastEpisode: Signal<boolean> = computed(() => {
    if (this.type() !== ShowTypeEnum.TV_SERIES) {
      return true;
    }
    return this.currentSeason() === this.seasons()[this.seasons().length - 1]?.season_number
      && this.currentEpisode() === this.currentSeasonInfo()?.episode_count;
  });
  readonly showId: Signal<number | undefined> = computed(() => {
    return this.routeParamMap().get('id') ? Number.parseInt(this.routeParamMap().get('id')!) : undefined;
  });
  readonly showInfo = resource({
    params: () => {
      const newId = this.showId()
      const newType = this.type()
      if (!newId || !newType) {
        return undefined;
      }
      return {id: newId, type: newType}
    },
    loader: async ({params, abortSignal}) => {
      if (params.type === ShowTypeEnum.MOVIES) {
        return await this.movieDBService.getInfoMovie(params.id, abortSignal)
      }
      if (params.type === ShowTypeEnum.TV_SERIES) {
        return await this.movieDBService.getInfoTvSeries(params.id, abortSignal)
      }
      return;
    },
  });

  checkpointTimeoutFlag = false;

  constructor() {
    effect(() => {
      if (this.type() === ShowTypeEnum.TV_SERIES) {
        const paramSeason = this.castNumber(this.routeParamMap().get('season'));
        const paramEpisode = this.castNumber(this.routeParamMap().get('episode'));
        if (paramSeason === undefined || paramEpisode === undefined) {
          console.error("No season or episode");
          this.router.navigate(['/player/tv-series', this.showId(), paramSeason || 1, paramEpisode || 1]);
        }
      }
      const showInfo = this.showInfo.value();
      this.title.setTitle('PintaStreaming - ' + (showInfo?.title || showInfo?.name || showInfo?.original_title))
    });
    afterNextRender(() => {
      this.listenPlayerEvents()
    })
    afterRenderEffect(() => {
      this.seasons();
      this.currentSeason();
      this.scrollSeasonEpisode(this.seasonWrapper()?.nativeElement);
      this.episodes();
      this.currentEpisode();
      this.scrollSeasonEpisode(this.episodeWrapper()?.nativeElement);
    });
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
    this.router.navigate(['/player/tv-series', this.showInfo.value()?.id, id, finalEpisode]);
  }

  goToSelectedEpisode(id: number, autoplay: boolean | undefined = undefined) {
    let finalEpisode = id;
    let finalSeason = this.currentSeason();
    const currentSeasonInfo = this.currentSeasonInfo();
    if (finalEpisode > (currentSeasonInfo?.episode_count ?? 0)) {
      finalSeason++;
      finalEpisode = 1;
    }
    if (finalEpisode < 1) {
      finalSeason--;
      finalEpisode = this.seasons().find(s => s.season_number === ((currentSeasonInfo?.season_number ?? 0) - 1))!.episode_count;
    }
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo.value()?.id, finalSeason, finalEpisode], {
      queryParams: {autoplay},
    });
  }

  goPrevious() {
    this.goToSelectedEpisode(this.currentEpisode() - 1);
  }

  goNext(autoplay: boolean | undefined = undefined) {
    this.goToSelectedEpisode(this.currentEpisode() + 1, autoplay);
  }

  // =============
  // PLAYER EVENTS
  // =============

  private listenPlayerEvents() {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        const videoStreamingDomain = this.videoStreamingDomain();
        if (!videoStreamingDomain || event.origin !== videoStreamingDomain) {
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

  private handleEndedEvent() {
    if (this.type() === ShowTypeEnum.TV_SERIES && !this.isLastEpisode()) {
      // TODO: switch autoplay to true when it works
      setTimeout(() => this.goNext(false), 5000);
      this.snackBar.open("Prossimo episodio in 1 secondi", "OK", {duration: 5000});
    }
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
      type: this.type(),
    } as ShowTime;
    if (this.type() === ShowTypeEnum.TV_SERIES) {
      checkpoint.season = this.currentSeason();
      checkpoint.episode = this.currentEpisode();
    }
    sessionStorage.setItem("checkpoint", JSON.stringify(checkpoint));
  }

  private createWatchCheckpoint(currentTime?: number, duration?: number) {
    return {
      id: this.showId(),
      type: this.type(),
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

  private scrollSeasonEpisode(wrapper: HTMLElement | undefined): void {
    if (!wrapper) return;

    const checked = wrapper.querySelector<HTMLElement>('.mat-button-toggle-checked');
    if (!checked) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const checkedRect = checked.getBoundingClientRect();

    // Centra il pulsante selezionato nel wrapper
    const left =
      wrapper.scrollLeft +
      (checkedRect.left - wrapperRect.left) -
      (wrapperRect.width - checkedRect.width) / 2;

    wrapper.scrollTo({left, behavior: 'smooth'});
  }

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
