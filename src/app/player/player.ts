import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {ShowDetails} from '../../interfaces/show';
import {
  MatCard,
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
    MatChip
  ],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player implements OnInit{

  private route = inject(ActivatedRoute);
  private movieDBService = inject(MovieDBService);
  videoUrl = signal('');
  private title = inject(Title);
  showInfo= signal({} as ShowDetails);
  protected sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    this.route.paramMap.subscribe(async params=>{
      const showID = Number.parseInt(params.get('id')!);
      const showCategory = params.get('category')!;
      console.log(showID, showCategory);
      if (showCategory === 'movies') {
        this.playMovie(showID);
      }
      if (showCategory === 'tv-series') {
        this.playTvSeries(showID);
      }
    });
  }

  getURLParams() {
    const urlParams = new URLSearchParams()
    urlParams.append("primaryColor", "115298")
    urlParams.append("secondaryColor", "2b2d30")
    urlParams.append("lang", "it")
    return urlParams;
  }

  private async playMovie(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoMovie(showID);
    this.showInfo.set(newShowInfo);
    this.title.setTitle('PintaStreaming - ' + newShowInfo.title);
    this.videoUrl.set(`https://vixsrc.to/movie/${showID}?${this.getURLParams()}`);
  }

  private async playTvSeries(showID: number) {
    const newShowInfo = await this.movieDBService.getInfoTvSeries(showID);
    this.showInfo.set(newShowInfo);
    this.title.setTitle('PintaStreaming - ' + newShowInfo.title);
    this.videoUrl.set(`https://vixsrc.to/tv/${showID}?${this.getURLParams()}`);
  }

}
