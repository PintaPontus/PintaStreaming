import {Component, inject} from '@angular/core';
import {MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {ShowResultsList} from '../../interfaces/show';
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
  items: ShowResultsList = {} as ShowResultsList;

  async searchItems() {
    if(this.textSearch !== '' && this.textSearch.length > 2){
      this.items = await this.movieDBService.search(this.textSearch)
    }
  }

  closeSearch() {
    this.dialogRef.close()
  }
}
