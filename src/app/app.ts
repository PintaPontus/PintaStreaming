import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Search} from './search/search';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  protected readonly title = signal('PintaStreaming');
  readonly dialog = inject(MatDialog);

  openSearch() {
    this.dialog.open(Search, {
      width: '800px'
    });
  }
}
