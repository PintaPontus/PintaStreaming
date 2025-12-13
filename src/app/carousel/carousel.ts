import {Component, effect, inject, input, InputSignal, signal, WritableSignal} from '@angular/core';
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
export class Carousel {

  title: InputSignal<string | undefined> = input();
  link: InputSignal<string | undefined> = input();
  listType = input(UserListTypeEnum.SUGGESTIONS);
  showType: InputSignal<ShowTypeEnum | undefined> = input();
  showList: InputSignal<UserListItem[]> = input([] as UserListItem[]);

  movieDBService = inject(MovieDBService);
  streamService = inject(StreamService);

  shows: WritableSignal<ShowReference[]> = signal([])

  constructor() {
    effect(async () => {
      const currLink = this.link();
      const currType = this.showType();
      const currShowList = this.showList();

      if (currLink && currType) {
        this.shows.set(await this.setupCategoryShows(currLink, currType));
      } else if (currShowList) {
        this.shows.set(await this.setupShowList(currShowList));
      }
    });
  }

  private async setupShowList(continueShows: UserListItem[]) {
    return await this.movieDBService.getShowListDetails(continueShows)
  }

  private async setupCategoryShows(categoryLink: string, type: ShowTypeEnum) {
    return await this.movieDBService.getShowsFromCategory(categoryLink, type)
  }

}
