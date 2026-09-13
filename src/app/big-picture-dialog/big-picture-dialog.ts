import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-result-picture-dialog',
  imports: [],
  templateUrl: './big-picture-dialog.html',
  styleUrl: './big-picture-dialog.css'
})
export class BigPictureDialog {
  data = inject(MAT_DIALOG_DATA);
}

export interface BigPictureDialogData {
  imgUrl: string | undefined;
}
