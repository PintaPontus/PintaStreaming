import {Component, inject, Input, OnInit, signal} from '@angular/core';
import {ShowResultsList, ShowTypeEnum} from '../../interfaces/show';
import {StreamService} from '../stream.service';
import {MovieDBService} from '../movie-db.service';
import {CarouselCard} from '../carousel-card/carousel-card';

@Component({
  selector: 'app-carousel',
  imports: [
    CarouselCard
  ],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel implements OnInit {

  @Input() title!: string;
  @Input() link!: string;
  @Input() type!: ShowTypeEnum;

  movieDBService = inject(MovieDBService);
  streamService = inject(StreamService);

  shows = signal({} as ShowResultsList);

  async ngOnInit() {
    this.shows.set(await this.movieDBService.getShows(this.link))
  }
}
