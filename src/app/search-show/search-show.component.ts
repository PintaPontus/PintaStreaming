import {afterNextRender, Component, computed, inject, resource, signal, viewChild} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MovieDBService} from '../movie-db.service';
import {ShowResultItem, ShowResultsList, ShowTypeEnum} from '../../interfaces/show';
import {RouterLink} from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {StreamService} from '../stream.service';
import {UserListItem} from '../../interfaces/users';
import {FirebaseService} from '../firebase.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {ResultPictureDialog} from './result-picture-dialog/result-picture-dialog';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';

const EMPTY_RESULTS: ShowResultsList = {results: [], page: 1, total_results: 0, total_pages: 0};

@Component({
  selector: 'app-search',
  imports: [
    MatFormField,
    FormsModule,
    MatInput,
    RouterLink,
    MatPaginator,
    MatProgressSpinner,
    MatTable,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatTooltip,
    MatRow,
    MatRowDef,
    MatList,
    MatListItem,
    MatDivider,
  ],
  templateUrl: './search-show.component.html',
  styleUrl: './search-show.component.css'
})
export class SearchShow {

  private readonly movieDBService = inject(MovieDBService);
  private readonly streamService = inject(StreamService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialog = inject(MatDialog);

  readonly userInfos = this.firebaseService.getUserInfosDetails();
  readonly searchInput = viewChild.required(MatInput);
  readonly textSearch = signal('');
  readonly page = signal(1);
  readonly searchResource = resource({
    params: () => ({query: this.textSearch(), page: this.page()}),
    loader: async ({params, abortSignal}) => {
      if (params.query.length <= 2) {
        return EMPTY_RESULTS;
      }
      return await this.movieDBService.search(params.query, params.page, abortSignal);
    },
    defaultValue: EMPTY_RESULTS,
  });
  readonly searchResults = computed(() => {
    // TODO: remove
    console.log(this.searchResource.value());
    return (this.searchResource.value()?.results || []).map(item => (
      {
        ...item,
        known_for: (item.known_for || []).map(knownItem => {
          return {
            ...knownItem,
            isAvailable: this.isAvailable(knownItem),
            isShow: this.isShow(knownItem),
            isFavorite: this.isFavorite(knownItem),
            playerUrl: this.getPlayerUrl(knownItem),
            infoUrl: this.getInfoUrl(knownItem)
          }
        }),
        isAvailable: this.isAvailable(item),
        isShow: this.isShow(item),
        isFavorite: this.isFavorite(item),
        playerUrl: this.getPlayerUrl(item),
        infoUrl: this.getInfoUrl(item)
      })
    );
  })
  readonly searchResultsColumns: string[] = ['poster', 'title', 'actions'];
  expandedElement: ShowResultItem | null = null;
  searchResultsDetailsColumns: string[] = [];

  constructor() {
    afterNextRender(() => this.focusSearchInput())
  }

  changePage($event: PageEvent) {
    this.page.set($event.pageIndex + 1);
  }

  focusSearchInput() {
    this.searchInput().focus();
  }

  toggleShowToFavorites(item: ShowResultItem) {
    this.firebaseService.toggleToFavorite({
      id: item.id,
      type: this.translateMediaType(item.media_type),
      lastUpdate: Date.now()
    } as UserListItem)
  }

  openBigPicture(element: ShowResultItem) {
    this.dialog.open(ResultPictureDialog, {
      data: {
        imgUrl: element.poster_path ?? element.profile_path,
      },
    });
  }

  isExpanded(element: ShowResultItem) {
    return this.expandedElement?.id === element.id && this.expandedElement?.media_type === element.media_type;
  }

  toggle(element: ShowResultItem) {
    this.expandedElement = this.isExpanded(element) ? null : element;
    this.searchResultsDetailsColumns = this.isExpanded(element) ? [] : ['expandedDetail'];
    console.log('toggle', this.expandedElement);
  }

  private isShow(item: ShowResultItem) {
    return !!this.translateMediaType(item.media_type);
  }

  private isAvailable(item: ShowResultItem) {
    const type = this.translateMediaType(item.media_type)
    return type && this.streamService.isAvailable(item.id, type);
  }

  private isFavorite(item: ShowResultItem) {
    return !!(this.userInfos()?.favorites || [])
      .find(f =>
        f.id === item.id
        && f.type === this.translateMediaType(item.media_type)
      );
  }

  private getPlayerUrl(item: ShowResultItem) {
    const type = this.translateMediaType(item.media_type);
    if (type === ShowTypeEnum.TV_SERIES) {
      return `/player/${type}/${item.id}/1/1`;
    } else if (type === ShowTypeEnum.MOVIES) {
      return `/player/${type}/${item.id}`;
    }
    return;
  }

  private getInfoUrl(item: ShowResultItem) {
    const type = this.translateMediaType(item.media_type)
    if (item.id !== undefined) {
      if (type === ShowTypeEnum.MOVIES) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.themoviedb.org/movie/${item.id}`
        );
      }
      if (type === ShowTypeEnum.TV_SERIES) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.themoviedb.org/tv/${item.id}`
        );
      }
      if (item.media_type === 'person') {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.themoviedb.org/person/${item.id}`
        );
      }
    }
    return;
  }

  private translateMediaType(mediaType: string) {
    if (mediaType === 'tv') {
      return ShowTypeEnum.TV_SERIES;
    } else if (mediaType === 'movie') {
      return ShowTypeEnum.MOVIES;
    }
    return;
  }

  protected readonly Array = Array;
}
