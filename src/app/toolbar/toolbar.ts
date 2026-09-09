import {Component, inject, model} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {RouterLink} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {FirebaseService} from '../firebase.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LanguageSelection} from '../language-selection/language-selection';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar} from '@angular/material/toolbar';
import {LoginMenu} from '../login-menu/login-menu';

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
    LoginMenu,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {


  private readonly firebaseService = inject(FirebaseService);
  private readonly movieDbService = inject(MovieDBService);
  private readonly bottomSheet = inject(MatBottomSheet);

  readonly user = this.firebaseService.getUserSessionDetails();
  readonly isAdmin = this.firebaseService.isAdmin;
  readonly language = this.movieDbService.getLanguage();
  readonly isSidenavOpen = model<boolean>(false);

  async logout() {
    await this.firebaseService.logout();
  }

  openLanguages() {
    this.bottomSheet.open(LanguageSelection);
  }

  openSidenav() {
    this.isSidenavOpen.set(true);
  }

}
