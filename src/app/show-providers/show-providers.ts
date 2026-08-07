import {Component, input} from '@angular/core';
import {ShowProvidersLocale} from '../../interfaces/show';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-show-providers',
  imports: [
    MatTooltip
  ],
  templateUrl: './show-providers.html',
  styleUrl: './show-providers.css'
})
export class ShowProviders {
  showProvidersLocale = input<ShowProvidersLocale | undefined>(undefined);
}
