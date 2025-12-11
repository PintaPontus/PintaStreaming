import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchShow} from './search-show.component';

describe('Search', () => {
  let component: SearchShow;
  let fixture: ComponentFixture<SearchShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchShow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchShow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
