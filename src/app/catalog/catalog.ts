import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {categories, ShowTypeEnum} from '../../interfaces/show';
import {Carousel} from '../carousel/carousel';
import {MatDivider} from '@angular/material/divider';
import {FirebaseService} from '../firebase.service';
import {UserListTypeEnum} from '../../interfaces/users';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-catalog',
  imports: [
    Carousel,
    MatDivider
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {

  readonly UserListTypeEnum = UserListTypeEnum;
  private readonly route = inject(ActivatedRoute);
  private readonly firebaseService = inject(FirebaseService);

  private readonly routeParamMap = toSignal(this.route.paramMap)

  readonly category = computed(() => this.routeParamMap()?.get('category') || undefined);
  readonly isCategorySelected = computed(() => {
    const categorySnap = this.category()
    return !!categorySnap
      && (
        categorySnap === ShowTypeEnum.MOVIES
        || categorySnap === ShowTypeEnum.TV_SERIES)
  });
  readonly userInfos = this.firebaseService.getUserInfosDetails()
  readonly continueToWatch = computed(() =>
    this.firebaseService.sortShowList(this.userInfos()?.continueToWatch || [])
  )
  readonly favorites = computed(() =>
    this.firebaseService.sortShowList(this.userInfos()?.favorites || [])
  )

  readonly displayCategories = computed(() => {
    switch (this.category()) {
      case ShowTypeEnum.MOVIES:
        return categories.filter(c =>
          c.type === ShowTypeEnum.MOVIES
        );
      case ShowTypeEnum.TV_SERIES:
        return categories.filter(c =>
          c.type === ShowTypeEnum.TV_SERIES
        );
      default:
        return categories;
    }
  });

}
