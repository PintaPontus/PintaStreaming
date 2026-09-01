import {afterNextRender, Component, inject, resource, signal, viewChild} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {ShowResultItem, ShowResultsList, ShowTypeEnum} from '../../interfaces/show';
import {RouterLink} from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

const EMPTY_RESULTS: ShowResultsList = {results: [], page: 1, total_results: 0, total_pages: 0};

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
    MatProgressSpinner,
  ],
  templateUrl: './search-show.component.html',
  styleUrl: './search-show.component.css'
})
export class SearchShow {

  readonly searchInput = viewChild.required(MatInput);

  textSearch = signal('');
  page = signal(1);
  private readonly movieDBService = inject(MovieDBService);

  protected readonly searchResource = resource({
    params: () => ({query: this.textSearch(), page: this.page()}),
    loader: ({params, abortSignal}) => {
      if (params.query.length <= 2) {
        return Promise.resolve(EMPTY_RESULTS);
      }
      return this.movieDBService.search(params.query, params.page, abortSignal);
    },
    defaultValue: EMPTY_RESULTS,
  });

  constructor() {
    afterNextRender(() => this.focusSearchInput())
  }

  getPlayerUrl(item: ShowResultItem) {
    const type = item.media_type === 'tv' ? ShowTypeEnum.TV_SERIES : ShowTypeEnum.MOVIES;
    if (type === ShowTypeEnum.TV_SERIES) {
      return `/player/${type}/${item.id}/1/1`;
    }
    return `/player/${type}/${item.id}`;
  }

  changePage($event: PageEvent) {
    this.page.set($event.pageIndex + 1);
  }

  focusSearchInput() {
    this.searchInput().focus();
  }

}
