import {Component, inject, Input, OnInit, signal, WritableSignal} from '@angular/core';
import {ShowReference, ShowTypeEnum} from '../../interfaces/show';
import {StreamService} from '../stream.service';
import {MovieDBService} from '../movie-db.service';
import {CarouselCard} from '../carousel-card/carousel-card';
import {UserListItem} from '../../interfaces/users';

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
  @Input() link: string | undefined;
  @Input() type: ShowTypeEnum | undefined;
  @Input() showList: UserListItem[] | undefined;

  movieDBService = inject(MovieDBService);
  streamService = inject(StreamService);

  shows: WritableSignal<ShowReference[]> = signal([]);

  ngOnInit() {
    if (this.link && this.type) {
      this.setupCategoryShows(this.link, this.type)
    } else if (this.showList) {
      this.setupShowList(this.showList)
    }
  }

  private async setupShowList(continueShows: UserListItem[]) {
    const detailedShows = await this.movieDBService.getShowListDetails(continueShows)
    this.shows.set(detailedShows);
  }

  private async setupCategoryShows(categoryLink: string, type: ShowTypeEnum) {
    const categoryShows = await this.movieDBService.getShowsFromCategory(categoryLink, type)
    this.shows.set(categoryShows)
  }
}
