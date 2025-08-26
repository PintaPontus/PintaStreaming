import { Routes } from '@angular/router';
import {Player} from './player/player';
import {Catalog} from './catalog/catalog';

export const routes: Routes = [
  {
    path: '',
    component: Catalog,
    title: 'PintaStreaming',
  },
  {
    path: ':category',
    component: Catalog,
  },
  {
    path: 'player/:id',
    component: Player,
    // title: 'Player',
  },
  { path: '**', redirectTo: 'catalog', },
];
