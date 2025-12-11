import {Component, inject, Signal, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SearchShow} from './search-show/search-show.component';
import {FirebaseService} from './firebase.service';
import {MatFabButton} from '@angular/material/button';
import {User} from '@firebase/auth';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LanguageSelection} from './language-selection/language-selection';
import {MatTooltip} from '@angular/material/tooltip';
import {MovieDBService} from './movie-db.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {EmailLogin} from './email-login/email-login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatFabButton, MatTooltip, MatMenuTrigger, MatMenu, MatMenuItem],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('PintaStreaming');
  private readonly firebaseService = inject(FirebaseService);
  user: Signal<User | undefined> = this.firebaseService.getUserSessionDetails();
  isAdmin: Signal<boolean> = this.firebaseService.isAdmin();
  private readonly movieDbService = inject(MovieDBService);
  readonly dialog = inject(MatDialog);

  language = this.movieDbService.getLanguage();
  private readonly bottomSheet = inject(MatBottomSheet);

  async loginWithEmail() {
    this.bottomSheet.open(EmailLogin);
  }

  async loginWithGoogle() {
    await this.firebaseService.loginWithGoogle();
  }

  async logout() {
    await this.firebaseService.logout();
  }

  openSearch() {
    this.dialog.open(SearchShow, {
      width: '800px'
    });
  }

  openLanguages() {
    this.bottomSheet.open(LanguageSelection);
  }
}
