import {Component, inject, output, Signal} from '@angular/core';
import {MatDivider, MatListItem, MatListItemIcon, MatListItemTitle, MatNavList} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {FirebaseService} from '../firebase.service';
import {User} from '@firebase/auth';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {LanguageSelection} from '../language-selection/language-selection';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LoginMenu} from '../login-menu/login-menu';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatListItem,
    RouterLink,
    MatDivider,
    MatNavList,
    MatMenu,
    MatMenuItem,
    MatListItemIcon,
    MatListItemTitle,
    MatMenuTrigger,
    LoginMenu,
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css'
})
export class Sidenav {

  private readonly firebaseService = inject(FirebaseService);
  user: Signal<User | undefined> = this.firebaseService.getUserSessionDetails();
  isAdmin: Signal<boolean> = this.firebaseService.isAdmin();

  private readonly bottomSheet = inject(MatBottomSheet);
  closing = output<void>();

  openLanguages() {
    this.closeSidenav();
    this.bottomSheet.open(LanguageSelection);
  }

  async logout() {
    await this.firebaseService.logout();
  }

  closeSidenav() {
    this.closing.emit();
  }
}
