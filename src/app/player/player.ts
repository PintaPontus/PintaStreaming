import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, SafeResourceUrl, Title} from '@angular/platform-browser';
import {ShowDetails, ShowTypeEnum} from '../../interfaces/show';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {toSignal} from '@angular/core/rxjs-interop';
import {PlayerRouteInfo} from '../../interfaces/routesInfo';
import {PlayerEvents} from '../../interfaces/playerEvents';
import {FirebaseService} from '../firebase.service';
import {UserListItem} from '../../interfaces/users';
import {PlayerCard} from '../player-card/player-card';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-player',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle,
    PlayerCard,
  ],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player implements OnInit {

  checkpointTimeoutFlag = false
  videoUrl: WritableSignal<SafeResourceUrl | undefined> = signal(undefined);
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
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      const startTime = this.castNumber(this.route.snapshot.queryParamMap.get("time"))
      if (this.routeData().type === ShowTypeEnum.MOVIES) {
        await this.setupMoviePlayer(showID, startTime);
      }
      if (this.routeData().type === ShowTypeEnum.TV_SERIES) {
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
      if (event.origin !== environment.videoStreamingDomain) {
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
    this.videoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/movie/${showID}?${this.getURLParams(time)}`
      )
    );
  }

  private async setupTvSeriesPlayer(showID: number, time?: number) {
    const newShowInfo = await this.movieDBService.getInfoTvSeries(showID);
    this.updateShowInfo(newShowInfo);
    this.videoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.videoStreamingDomain}/tv/${showID}/${(this.currentSeason())}/${this.currentEpisode()}?${this.getURLParams(time)}`
      )
    );
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
