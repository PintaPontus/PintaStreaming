import {Component, inject, input, InputSignal, OnInit, signal, WritableSignal} from '@angular/core';
import {ShowReference, ShowTypeEnum} from '../../interfaces/show';
import {StreamService} from '../stream.service';
import {MovieDBService} from '../movie-db.service';
import {CarouselCard} from '../carousel-card/carousel-card';
import {UserListItem, UserListTypeEnum} from '../../interfaces/users';

@Component({
  selector: 'app-carousel',
  imports: [
    CarouselCard
  ],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel implements OnInit {

  title: InputSignal<string | undefined> = input();
  link: InputSignal<string | undefined> = input();
  listType = input(UserListTypeEnum.SUGGESTIONS);
  showType: InputSignal<ShowTypeEnum | undefined> = input();
  showList: InputSignal<UserListItem[] | undefined> = input();

  movieDBService = inject(MovieDBService);
  streamService = inject(StreamService);

  shows: WritableSignal<ShowReference[]> = signal([]);

  ngOnInit() {
    const currLink = this.link();
    const currType = this.showType();
    const currShowList = this.showList();

    if (currLink && currType) {
      this.setupCategoryShows(currLink, currType)
    } else if (currShowList) {
      this.setupShowList(currShowList)
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
