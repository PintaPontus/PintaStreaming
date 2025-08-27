import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CarouselCard} from './carousel-card';

describe('CarouselCard', () => {
  let component: CarouselCard;
  let fixture: ComponentFixture<CarouselCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselCard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CarouselCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
