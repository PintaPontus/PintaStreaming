import {Component, inject, OnInit, Signal, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Search} from './search/search';
import {FirebaseService} from './firebase.service';
import {MatFabButton} from '@angular/material/button';
import {User} from '@firebase/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatFabButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('PintaStreaming');
  user: Signal<User | null> = signal(null);
  isAdmin: Signal<boolean> = signal(false);
  readonly dialog = inject(MatDialog);
  private firebaseService = inject(FirebaseService);

  async ngOnInit() {
    this.user = await this.firebaseService.getUserDetails();
    this.isAdmin = await this.firebaseService.isAdmin();
  }

  async login() {
    await this.firebaseService.loginWithGoogle();
  }

  openSearch() {
    this.dialog.open(Search, {
      width: '800px'
    });
  }
}
