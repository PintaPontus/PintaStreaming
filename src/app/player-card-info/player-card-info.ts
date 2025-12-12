import {Component, computed, input, InputSignal} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {ShowDetails, ShowSeason, ShowTranslation, ShowTypeEnum} from '../../interfaces/show';

@Component({
  selector: 'app-player-card-info',
  imports: [
    MatAccordion,
    MatChip,
    MatChipSet,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription
  ],
  templateUrl: './player-card-info.html',
  styleUrl: './player-card-info.css'
})
export class PlayerCardInfo {

  currentSeasonInfo: InputSignal<ShowSeason | undefined> = input();
  showInfo = input({} as ShowDetails);
  showType = input(ShowTypeEnum.MOVIES);
  showTranslation: InputSignal<ShowTranslation | undefined> = input();

  showCardOverview = computed(() => {
    return this.showTranslation()?.data.overview
      || this.showInfo().overview;
  });

  showCardSeasonTitle = computed(() => {
    const currSeason = this.currentSeasonInfo();
    return currSeason?.name || ("Season " + currSeason?.season_number);
  });

}
