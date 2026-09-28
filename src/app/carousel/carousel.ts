import {Component, ElementRef, inject, input, InputSignal, resource, viewChild} from '@angular/core';
import {ShowTypeEnum} from '../../interfaces/show';
import {MovieDBService} from '../movie-db.service';
import {CarouselCard} from '../carousel-card/carousel-card';
import {UserListItem, UserListTypeEnum} from '../../interfaces/users';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-carousel',
  imports: [
    CarouselCard,
    MatIconButton
  ],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel {

  private readonly movieDBService = inject(MovieDBService);

  showsList = viewChild<ElementRef<HTMLDivElement>>('showsList');

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

  protected prevPage() {
    const el = this.showsList()?.nativeElement;
    if (el) {
      el.scrollBy({left: (-(el.clientWidth)) * 0.9, behavior: 'smooth'});
    }
  }

  protected nextPage() {
    const el = this.showsList()?.nativeElement;
    if (el) {
      el.scrollBy({left: (el.clientWidth) * 0.9, behavior: 'smooth'});
    }
  }

  protected readonly UserListTypeEnum = UserListTypeEnum;
}
