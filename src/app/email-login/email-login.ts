import {Component, inject} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatFabButton} from '@angular/material/button';
import {FirebaseService} from '../firebase.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {FormsModule} from '@angular/forms';
import firebase from 'firebase/compat/app';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogTitle} from '@angular/material/dialog';
import FirebaseError = firebase.FirebaseError;

@Component({
  selector: 'app-email-login',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatFabButton,
    FormsModule,
    MatDialogTitle
  ],
  templateUrl: './email-login.html',
  styleUrl: './email-login.css'
})
export class EmailLogin {

  textEmail: string = '';
  textPassword: string = '';
  private readonly firebaseService = inject(FirebaseService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);

  async login() {
    try {
      await this.firebaseService.loginWithEmail(this.textEmail, this.textPassword)
    } catch (e) {
      this.handleLoginError(e as FirebaseError)
    }
    this.bottomSheet.dismiss();
  }

  async signup() {
    try {
      await this.firebaseService.signupWithEmail(this.textEmail, this.textPassword)
    } catch (e) {
      this.handleLoginError(e as FirebaseError)
    }
    this.bottomSheet.dismiss();
  }

  private handleLoginError(e: FirebaseError) {
    console.error('Email login error: ', e.code, e.message);
    this.snackBar.open(e.message, "OK", {duration: 2000});
  }
}
