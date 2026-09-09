import {Component, inject, input, InputSignal, resource} from '@angular/core';
import {ShowTypeEnum} from '../../interfaces/show';
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

  private readonly movieDBService = inject(MovieDBService);

  readonly title: InputSignal<string | undefined> = input();
  readonly link: InputSignal<string | undefined> = input();
  readonly listType = input(UserListTypeEnum.SUGGESTIONS);
  readonly showType: InputSignal<ShowTypeEnum | undefined> = input();
  readonly showList: InputSignal<UserListItem[]> = input([] as UserListItem[]);
  readonly shows = resource({
    params: () => ({link: this.link(), type: this.showType(), showList: this.showList()}),
    loader: async ({params}) => {
      if (params.link && params.type) {
        return await this.setupCategoryShows(params.link, params.type);
      } else if (params.showList) {
        return await this.setupShowList(params.showList);
      }
      return;
    },
  })

  private async setupShowList(continueShows: UserListItem[]) {
    return await this.movieDBService.getShowListDetails(continueShows)
  }

  private async setupCategoryShows(categoryLink: string, type: ShowTypeEnum) {
    return await this.movieDBService.getShowsFromCategory(categoryLink, type)
  }

}
