import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-result-picture-dialog',
  imports: [],
  templateUrl: './result-picture-dialog.html',
  styleUrl: './result-picture-dialog.css'
})
export class ResultPictureDialog {
  data = inject(MAT_DIALOG_DATA);
}
