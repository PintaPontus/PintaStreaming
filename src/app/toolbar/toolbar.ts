import {Component, inject, model, Signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {RouterLink} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {MatDialog} from '@angular/material/dialog';
import {User} from '@firebase/auth';
import {FirebaseService} from '../firebase.service';
import {EmailLogin} from '../email-login/email-login';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SearchShow} from '../search-show/search-show.component';
import {LanguageSelection} from '../language-selection/language-selection';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatMenu,
    MatMenuItem,
    RouterLink,
    MatTooltip,
    MatMenuTrigger,
    MatToolbar,
    MatButton,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {


  private readonly firebaseService = inject(FirebaseService);
  user: Signal<User | undefined> = this.firebaseService.getUserSessionDetails();
  isAdmin: Signal<boolean> = this.firebaseService.isAdmin();
  private readonly movieDbService = inject(MovieDBService);

  language = this.movieDbService.getLanguage();
  private readonly bottomSheet = inject(MatBottomSheet);


  readonly dialog = inject(MatDialog);
  isSidenavOpen = model<boolean>(false);

  async loginWithEmail() {
    this.dialog.open(EmailLogin, {
      width: '800px'
    });
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

  openSidenav() {
    this.isSidenavOpen.set(true);
  }

}
