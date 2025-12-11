import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EmailLogin} from './email-login';

describe('EmailLogin', () => {
  let component: EmailLogin;
  let fixture: ComponentFixture<EmailLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailLogin]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmailLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
