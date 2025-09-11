import {Routes} from '@angular/router';
import {Player} from './player/player';
import {Catalog} from './catalog/catalog';
import {AdminPanel} from './admin-panel/admin-panel';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog/all',
    pathMatch: 'full',
  },
  {
    path: 'catalog/:category',
    component: Catalog,
    title: 'PintaStreaming',
  },
  {
    path: 'player/tv-series/:id/:season/:episode',
    component: Player,
    data: {
      type: 'tv-series',
    },
  },
  {
    path: 'player/movies/:id',
    component: Player,
    data: {
      type: 'movies',
    }
  },
  {
    path: 'admin',
    component: AdminPanel,
  },
  {path: '**', redirectTo: 'catalog/all',},
];
