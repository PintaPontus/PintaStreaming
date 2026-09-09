import {Component, inject, resource} from '@angular/core';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-language-selection',
  imports: [
    MatNavList,
    MatListItem,
    MatProgressSpinner
  ],
  templateUrl: './language-selection.html',
  styleUrl: './language-selection.css'
})
export class LanguageSelection {

  private readonly movieDbService = inject(MovieDBService);
  private readonly bottomSheet = inject(MatBottomSheet);

  readonly languages = resource({
    loader: async () => (await this.movieDbService.getLanguages())
      .sort((a, b) => {
        const nameA = a.name || a.english_name;
        const nameB = b.name || b.english_name;
        return nameA.localeCompare(nameB)
      }),
  });

  setLanguage(langId: string) {
    this.movieDbService.setLanguage(langId);
    this.bottomSheet.dismiss();
  }

}
