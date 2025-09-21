import {Component, inject, Signal, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Search} from './search/search';
import {FirebaseService} from './firebase.service';
import {MatFabButton} from '@angular/material/button';
import {User} from '@firebase/auth';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LanguageSelection} from './language-selection/language-selection';
import {MatTooltip} from '@angular/material/tooltip';
import {MovieDBService} from './movie-db.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatFabButton, MatTooltip],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('PintaStreaming');
  private readonly firebaseService = inject(FirebaseService);
  user: Signal<User | null> = this.firebaseService.getUserDetails();
  isAdmin: Signal<boolean> = this.firebaseService.isAdmin();
  private readonly movieDbService = inject(MovieDBService);
  readonly dialog = inject(MatDialog);

  language = this.movieDbService.getLanguage();
  private readonly bottomSheet = inject(MatBottomSheet);

  async login() {
    await this.firebaseService.loginWithGoogle();
  }

  openSearch() {
    this.dialog.open(Search, {
      width: '800px'
    });
  }

  openLanguages() {
    this.bottomSheet.open(LanguageSelection);
  }
}
