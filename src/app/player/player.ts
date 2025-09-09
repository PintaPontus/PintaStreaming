import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
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

  category = signal('movies');
  private route = inject(ActivatedRoute);
  private movieDBService = inject(MovieDBService);
  videoUrl = signal('');
  infoUrl = signal('');
  seasons = computed(() => this.showInfo().seasons || []);
  episodes = computed(() => {
    const currentSeasonInfo = this.getCurrentSeason()
    return currentSeasonInfo?.episode_count
      ? Array.from({length: currentSeasonInfo.episode_count}, (_, i) => i + 1)
        .map(i => ({id: i}))
      : [];
  });
  currentSeason = signal(1);
  currentEpisode = signal(1);
  private router = inject(Router);
  private title = inject(Title);
  showInfo = signal({} as ShowDetails);
  protected sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      this.category.set(params.get('category')!);

      if (this.category() === 'movies') {
        await this.playMovie(showID);
      }
      if (this.category() === 'tv-series') {
        const paramSeason = this.castNumber(params.get('season'));
        const paramEpisode = this.castNumber(params.get('episode'));
        if (!paramSeason || !paramEpisode) {
          await this.router.navigate(['/player/tv-series', showID, paramSeason || 1, paramSeason || 1]);
        }
        this.currentSeason.set(Number.parseInt(params.get('season')!));
        this.currentEpisode.set(Number.parseInt(params.get('episode')!));
        await this.playTvSeries(showID);
      }
    });
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
    this.router.navigate(['/player/tv-series', this.showInfo().id, id, this.currentEpisode()]);
  }

  private getURLParams() {
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    return urlParams;
  }

  // getEpisodeTitle() {
  //   return "Season 1 - Episode 1";
  // }

  selectEpisode(id: number) {
    this.router.navigate(['/player/tv-series', this.showInfo().id, this.currentSeason(), id]);
  }

  private castNumber(number: string | null) {
    return !number || Number.isNaN(Number.parseInt(number)) ? null : Number.parseInt(number);
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
    console.log(newShowInfo);
    this.videoUrl.set(`https://vixsrc.to/tv/${showID}/${(this.currentSeason())}/${this.currentEpisode()}?${this.getURLParams()}`);
    this.infoUrl.set(`https://www.themoviedb.org/tv/${showID}`);
  }

  private updateShowInfo(showInfo: ShowDetails) {
    this.showInfo.set(showInfo);
    this.title.setTitle('PintaStreaming - ' + (showInfo.title || showInfo.name || showInfo.original_title));
  }
}
