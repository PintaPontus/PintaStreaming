import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PlayerCardInfo} from './player-card-info';

describe('PlayerCardInfo', () => {
  let component: PlayerCardInfo;
  let fixture: ComponentFixture<PlayerCardInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCardInfo]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PlayerCardInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
