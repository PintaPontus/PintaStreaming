import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BigPictureDialog} from './big-picture-dialog';

describe('ResultPictureDialog', () => {
  let component: BigPictureDialog;
  let fixture: ComponentFixture<BigPictureDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigPictureDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BigPictureDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
