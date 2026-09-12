import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResultPictureDialog} from './result-picture-dialog';

describe('ResultPictureDialog', () => {
  let component: ResultPictureDialog;
  let fixture: ComponentFixture<ResultPictureDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultPictureDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResultPictureDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
