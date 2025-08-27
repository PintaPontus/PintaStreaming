import {Component, inject, signal} from '@angular/core';
import {MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {ShowResultItem, ShowResultsList, ShowTypeEnum} from '../../interfaces/show';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [
    MatDialogContent,
    MatFormField,
    FormsModule,
    MatInput,
    MatList,
    MatListItem,
    RouterLink,
    MatDivider,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search{
  textSearch: string = '';

  private movieDBService = inject(MovieDBService);
  readonly dialogRef = inject(MatDialogRef<Search>);
  items = signal({} as ShowResultsList);

  async searchItems() {
    if(this.textSearch !== '' && this.textSearch.length > 2){
      const searchResult = await this.movieDBService.search(this.textSearch);
      this.items.set(searchResult);
    }
  }

  closeSearch() {
    this.dialogRef.close()
  }

  getPlayerUrl(item: ShowResultItem) {
    const type = item.media_type === 'tv' ? ShowTypeEnum.TV_SERIES : ShowTypeEnum.MOVIES;
    return `/player/${type}/${item.id}`;
  }
}
