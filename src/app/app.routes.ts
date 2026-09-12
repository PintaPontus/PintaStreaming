import {Router, Routes} from '@angular/router';
import {Player} from './player/player';
import {Catalog} from './catalog/catalog';
import {AdminPanel} from './admin-panel/admin-panel';
import {SearchShow} from './search-show/search-show.component';
import {inject} from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: Catalog,
    title: 'PintaStreaming',
  },
  {
    path: 'catalog/:category',
    redirectTo: (redirectData) => {
      const router = inject(Router);

      const paramValue = redirectData.params['category'];

      return router.createUrlTree(['/'], {
        queryParams: {category: paramValue !== 'all' ? paramValue : null}
      });
    }
  },
  {
    path: 'search',
    component: SearchShow,
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
