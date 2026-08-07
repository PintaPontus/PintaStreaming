import {Component, inject} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatFabButton} from '@angular/material/button';
import {FirebaseService} from '../firebase.service';
import {FormsModule} from '@angular/forms';
import firebase from 'firebase/compat/app';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
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
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<EmailLogin>);

  async login() {
    try {
      await this.firebaseService.loginWithEmail(this.textEmail, this.textPassword)
    } catch (e) {
      this.handleLoginError(e as FirebaseError)
    }
    this.endEmailLogin()
  }

  async signup() {
    try {
      await this.firebaseService.signupWithEmail(this.textEmail, this.textPassword)
    } catch (e) {
      this.handleLoginError(e as FirebaseError)
    }
    this.endEmailLogin()
  }

  endEmailLogin() {
    if (this.firebaseService.isLogged()) {
      this.snackBar.open('Login completato', "OK", {duration: 2000});
    }
    this.dialogRef.close();
  }

  private handleLoginError(e: FirebaseError) {
    console.error('Email login error: ', e.code, e.message);
    this.snackBar.open(e.message, "OK", {duration: 2000});
  }
}
