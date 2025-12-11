import {Component, inject} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatFabButton} from '@angular/material/button';
import {FirebaseService} from '../firebase.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-email-login',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatFabButton,
    FormsModule
  ],
  templateUrl: './email-login.html',
  styleUrl: './email-login.css'
})
export class EmailLogin {

  textEmail: string = '';
  textPassword: string = '';
  private readonly firebaseService = inject(FirebaseService);
  private readonly bottomSheet = inject(MatBottomSheet);

  async login() {
    await this.firebaseService.loginWithEmail(this.textEmail, this.textPassword)
    this.bottomSheet.dismiss();
  }

  async signup() {
    await this.firebaseService.signupWithEmail(this.textEmail, this.textPassword)
    this.bottomSheet.dismiss();
  }

}
