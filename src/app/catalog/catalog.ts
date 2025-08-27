import {Component, inject, OnInit, signal} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {StreamService} from '../stream.service';
import {ShowTypeEnum} from '../../interfaces/show';
import {Carousel} from '../carousel/carousel';
import {MatDivider} from '@angular/material/divider';

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

  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private streamService = inject(StreamService);

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

  async ngOnInit() {
    this.streamService.refreshShows();
    this.route.paramMap.subscribe(async params => {
      const category = params.get('category');
      switch (category) {
        case 'movies':
          this.title.setTitle('PintaStreaming - Film');
          this.displayCategories.set(this.categories.filter(c => c.type === ShowTypeEnum.MOVIES));
          break;
        case 'tv-series':
          this.title.setTitle('PintaStreaming - Serie TV');
          this.displayCategories.set(this.categories.filter(c => c.type === ShowTypeEnum.TV_SERIES));
          break;
        default:
          this.title.setTitle('PintaStreaming');
          this.displayCategories.set(this.categories);
          break;
      }
    });
  }
}
