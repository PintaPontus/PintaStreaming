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
    path: 'player/:category/:id',
    component: Player,
  },
  {
    path: 'player/:category/:id/:season/:episode',
    component: Player,
  },
  {
    path: 'admin',
    component: AdminPanel,
  },
  {path: '**', redirectTo: 'catalog/all',},
];
