import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LanguageSelection} from './language-selection';

describe('LanguageSelection', () => {
  let component: LanguageSelection;
  let fixture: ComponentFixture<LanguageSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LanguageSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
