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

  private readonly route = inject(ActivatedRoute);
  routeData = toSignal(this.route.data) as Signal<PlayerRouteInfo>;
  private readonly movieDBService = inject(MovieDBService);
  videoUrl = signal('');
  infoUrl = signal('');
  seasons = computed(() => this.showInfo().seasons || []);
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
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  showInfo = signal({} as ShowDetails);
  language = this.movieDBService.getLanguage();
  showTranslation = computed(() => {
    const language = this.language() || 'en';
    return this.showInfo().translations.translations.find(t =>
      t.iso_639_1 === language
    )
  });
  protected sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      if (this.routeData().type === 'movies') {
        await this.playMovie(showID);
      }
      if (this.routeData().type === 'tv-series') {
        const paramSeason = this.castNumber(params.get('season'));
        const paramEpisode = this.castNumber(params.get('episode'));
        if (!paramSeason || !paramEpisode) {
          console.log("No season or episode");
          await this.router.navigate(['/player/tv-series', showID, paramSeason || 1, paramSeason || 1]);
        }
        this.currentSeason.set(Number.parseInt(params.get('season')!));
        this.currentEpisode.set(Number.parseInt(params.get('episode')!));
        await this.playTvSeries(showID);
      }
    });
  }

  getShowTitle() {
    return this.showTranslation()?.data.title
      || this.showInfo().title
      || this.showInfo().name
      || this.showInfo().original_title;
  }

  getShowOverview() {
    return this.showTranslation()?.data.overview
      || this.showInfo().overview;
  }

  getCurrentSeason() {
    return this.seasons().find(s => s.season_number === this.currentSeason())
  }

  getVideoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl());
  }

  getInfoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.infoUrl());
  }

  getSeasonTitle() {
    const currSeason = this.getCurrentSeason();
    return currSeason?.name || ("Season " + currSeason?.season_number);
  }

  getSeasonDescription() {
    return this.getCurrentSeason()?.overview || "";
  }

  selectSeason(id: number) {
    let finalEpisode = this.currentEpisode();
    if (this.seasons().find(s => s.season_number === id)!.episode_count < finalEpisode) {
      finalEpisode = 1;
    }
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo().id, id, finalEpisode]);
  }

  selectEpisode(id: number) {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/player/tv-series', this.showInfo().id, this.currentSeason(), id]);
  }

  private async playMovie(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoMovie(showID);
    this.updateShowInfo(newShowInfo);
    this.videoUrl.set(`https://vixsrc.to/movie/${showID}?${this.getURLParams()}`);
    this.infoUrl.set(`https://www.themoviedb.org/movie/${showID}`);
  }

  private async playTvSeries(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoTvSeries(showID);
    this.updateShowInfo(newShowInfo);
    this.videoUrl.set(`https://vixsrc.to/tv/${showID}/${(this.currentSeason())}/${this.currentEpisode()}?${this.getURLParams()}`);
    this.infoUrl.set(`https://www.themoviedb.org/tv/${showID}`);
  }

  private updateShowInfo(showInfo: ShowDetails) {
    this.showInfo.set(showInfo);
    this.title.setTitle('PintaStreaming - ' + (showInfo.title || showInfo.name || showInfo.original_title));
  }

  private getURLParams() {
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    return urlParams;
  }

  private castNumber(number: string | null) {
    return !number || Number.isNaN(Number.parseInt(number)) ? null : Number.parseInt(number);
  }
}
