import {Component, inject, OnInit, signal} from '@angular/core';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MovieDBService} from '../movie-db.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ShowLanguage} from '../../interfaces/show';

@Component({
  selector: 'app-language-selection',
  imports: [
    MatNavList,
    MatListItem
  ],
  templateUrl: './language-selection.html',
  styleUrl: './language-selection.css'
})
export class LanguageSelection implements OnInit {
  languages = signal([] as ShowLanguage[]);
  private readonly movieDbService = inject(MovieDBService);
  private readonly bottomSheet = inject(MatBottomSheet);

  setLanguage(langId: string) {
    this.bottomSheet.dismiss();
    this.movieDbService.setLanguage(langId)
  }

  async ngOnInit() {
    const availableLanguages = await this.movieDbService.getLanguages();
    const sortedLanguages = availableLanguages
      .sort((a, b) => {
        const nameA = a.name || a.english_name;
        const nameB = b.name || b.english_name;
        return nameA.localeCompare(nameB)
      });
    this.languages.set(sortedLanguages);
  }
}
