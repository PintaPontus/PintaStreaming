import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
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
    MatCardActions
  ],
  templateUrl: './player.html',
  styleUrl: './player.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Player implements OnInit {

  private route = inject(ActivatedRoute);
  private movieDBService = inject(MovieDBService);
  videoUrl = signal('');
  infoUrl = signal('');
  private title = inject(Title);
  showInfo = signal({} as ShowDetails);
  protected sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const showID = Number.parseInt(params.get('id')!);
      const showCategory = params.get('category')!;

      if (showCategory === 'movies') {
        await this.playMovie(showID);
      }
      if (showCategory === 'tv-series') {
        await this.playTvSeries(showID);
      }
    });

  }

  getVideoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl());
  }

  getInfoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.infoUrl());
  }

  private async playMovie(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoMovie(showID);
    this.showInfo.set(newShowInfo);
    this.title.setTitle('PintaStreaming - ' + newShowInfo.title);
    this.videoUrl.set(`https://vixsrc.to/movie/${showID}?${this.getURLParams()}`);
    this.infoUrl.set(`https://www.themoviedb.org/movie/${showID}`);
  }

  private async playTvSeries(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoTvSeries(showID);
    this.showInfo.set(newShowInfo);
    this.title.setTitle('PintaStreaming - ' + newShowInfo.title);
    this.videoUrl.set(`https://vixsrc.to/tv/${showID}?${this.getURLParams()}`);
    this.infoUrl.set(`https://www.themoviedb.org/tv/${showID}`);
  }

  private getURLParams() {
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    return urlParams;
  }
}
