import {Component, inject, output} from '@angular/core';
import {MatMenuItem} from '@angular/material/menu';
import {EmailLogin} from '../email-login/email-login';
import {MatDialog} from '@angular/material/dialog';
import {FirebaseService} from '../firebase.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-menu',
  imports: [
    MatMenuItem
  ],
  templateUrl: './login-menu.html',
  styleUrl: './login-menu.css'
})
export class LoginMenu {

  readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private readonly firebaseService = inject(FirebaseService);
  loginStarted = output<void>();

  async loginWithEmail() {
    await this.executeLogin(async () => {
      this.dialog.open(EmailLogin, {
        width: '800px'
      })
    })
  }

  async loginWithGoogle() {
    await this.executeLogin(() => this.firebaseService.loginWithGoogle())
  }

  async loginWithGithub() {
    await this.executeLogin(() => this.firebaseService.loginWithGithub())
  }

  async executeLogin(fun: () => Promise<void>) {
    this.loginStarted.emit();
    try {
      await fun();
      this.snackBar.open('Login completato', "OK", {duration: 2000});
    } catch (e) {
      this.snackBar.open(e as string, "OK", {duration: 2000});
      console.error(e);
    }
  }

}
