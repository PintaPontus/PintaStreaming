import {Component, inject, OnInit, signal, Signal} from '@angular/core';
import {ShowResource} from '../../interfaces/show';
import {StreamService} from '../stream.service';
import {FirebaseService} from '../firebase.service';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-admin-panel',
  imports: [
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    FormsModule,
    MatLabel,
    MatFabButton,
    MatIcon
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {

  movies: Signal<ShowResource[]> = signal([]);
  tvSeries: Signal<ShowResource[]> = signal([]);

  moviesText = signal('');
  tvSeriesText = signal('');

  private firebaseService = inject(FirebaseService);
  private streamService = inject(StreamService);
  private snackBar = inject(MatSnackBar);

  async ngOnInit() {
    this.movies = await this.streamService.getMovies();
    this.tvSeries = await this.streamService.getTvSeries();
    this.moviesText.set(JSON.stringify(this.movies()));
    this.tvSeriesText.set(JSON.stringify(this.tvSeries()));
  }

  refreshShows() {
    this.streamService.refreshShows();
    this.moviesText.set(JSON.stringify(this.movies()));
    this.tvSeriesText.set(JSON.stringify(this.tvSeries()));
  }

  async updateShows() {
    if (this.moviesText().length > 0 && this.tvSeriesText().length > 0) {
      await this.firebaseService.updateShows(
        JSON.parse(this.moviesText()) as ShowResource[],
        JSON.parse(this.tvSeriesText()) as ShowResource[],
      );
      this.openSnackBar("Shows updated!");
    } else {
      this.openSnackBar("You need to fill the fields!");
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, "OK", {duration: 2000});
  }

  getTextMovies() {
    return JSON.stringify(this.movies());
  }

  getTextTVSeries() {
    return JSON.stringify(this.tvSeries());
  }
}
