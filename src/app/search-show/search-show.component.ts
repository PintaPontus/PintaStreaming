import {Component, inject, signal} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {ShowResultItem, ShowResultsList, ShowTypeEnum} from '../../interfaces/show';
import {RouterLink} from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-search',
  imports: [
    MatFormField,
    FormsModule,
    MatInput,
    MatList,
    MatListItem,
    RouterLink,
    MatDivider,
    MatPaginator,
  ],
  templateUrl: './search-show.component.html',
  styleUrl: './search-show.component.css'
})
export class SearchShow {
  textSearch = '';
  page = signal(1);

  private readonly movieDBService = inject(MovieDBService);
  items = signal({} as ShowResultsList);

  async searchItems() {
    if(this.textSearch !== '' && this.textSearch.length > 2){
      const searchResult = await this.movieDBService.search(this.textSearch, this.page());
      this.items.set(searchResult);
    } else {
      this.items.set({} as ShowResultsList);
    }
  }

  getPlayerUrl(item: ShowResultItem) {
    const type = item.media_type === 'tv' ? ShowTypeEnum.TV_SERIES : ShowTypeEnum.MOVIES;
    if (type === ShowTypeEnum.TV_SERIES) {
      return `/player/${type}/${item.id}/1/1`;
    }
    return `/player/${type}/${item.id}`;
  }

  async changePage($event: PageEvent) {
    console.log($event);
    this.page.set($event.pageIndex + 1);
    await this.searchItems()
  }
}
