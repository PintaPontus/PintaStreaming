import {Component, effect, inject, signal, Signal} from '@angular/core';
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
import {environment} from '../../environments/environment';

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
export class AdminPanel {

  private readonly firebaseService = inject(FirebaseService);
  private readonly streamService = inject(StreamService);
  private readonly snackBar = inject(MatSnackBar);

  readonly movies: Signal<ShowResource[]> = this.streamService.getMovies();
  readonly tvSeries: Signal<ShowResource[]> = this.streamService.getTvSeries();
  readonly moviesText = signal('');
  readonly tvSeriesText = signal('');

  constructor() {
    effect(() => {
      this.moviesText.set(JSON.stringify(this.movies()));
      this.tvSeriesText.set(JSON.stringify(this.tvSeries()));
    });
  }

  async refreshShows() {
    await this.streamService.refreshShows();
    this.openSnackBar("Shows refreshed!");
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

  getMovieListURL() {
    return `${environment.videoStreamingDomain}/api/list/movie?lang=it`;
  }

  getTvSeriesListURL() {
    return `${environment.videoStreamingDomain}/api/list/tv?lang=it`;
  }
}
