import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StreamService} from '../stream.service';
import {ShowTypeEnum} from '../../interfaces/show';
import {Carousel} from '../carousel/carousel';
import {MatDivider} from '@angular/material/divider';
import {FirebaseService} from '../firebase.service';
import {UserListTypeEnum} from '../../interfaces/users';

@Component({
  selector: 'app-catalog',
  imports: [
    Carousel,
    MatDivider
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {

  protected readonly UserListTypeEnum = UserListTypeEnum;

  private route = inject(ActivatedRoute);
  private streamService = inject(StreamService);
  private firebaseService = inject(FirebaseService);

  private readonly categories = [
    {
      id: 0,
      name: 'Film Popolari',
      link: 'movie/popular',
      type: ShowTypeEnum.MOVIES,
    },
    {
      id: 1,
      name: 'Serie TV Popolari',
      link: 'tv/popular',
      type: ShowTypeEnum.TV_SERIES,
    },
    {
      id: 2,
      name: 'Film Più Votati',
      link: 'movie/top_rated',
      type: ShowTypeEnum.MOVIES,
    },
    {
      id: 3,
      name: 'Serie TV Più Votate',
      link: 'tv/top_rated',
      type: ShowTypeEnum.TV_SERIES,
    },
  ];

  displayCategories = signal(this.categories);

  userInfos = this.firebaseService.getUserInfosDetails()

  continueToWatch = computed(() =>
    this.userInfos()?.continueToWatch || []
  )

  favorites = computed(() =>
    this.userInfos()?.favorites || []
  )

  ngOnInit() {
    this.streamService.refreshShows();
    this.setupCategoryFilter();
  }

  private setupCategoryFilter() {
    this.route.paramMap.subscribe(async params => {
      const category = params.get('category');
      switch (category) {
        case ShowTypeEnum.MOVIES:
          this.displayCategories.set(
            this.categories.filter(c =>
              c.type === ShowTypeEnum.MOVIES
            )
          );
          break;
        case ShowTypeEnum.TV_SERIES:
          this.displayCategories.set(
            this.categories.filter(c =>
              c.type === ShowTypeEnum.TV_SERIES
            )
          );
          break;
        default:
          this.displayCategories.set(this.categories);
          break;
      }
    });
  }

}
