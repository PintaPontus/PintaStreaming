import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ShowProviders} from './show-providers';

describe('ShowProviders', () => {
  let component: ShowProviders;
  let fixture: ComponentFixture<ShowProviders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowProviders]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ShowProviders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
