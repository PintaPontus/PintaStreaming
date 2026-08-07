import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginMenu} from './login-menu';

describe('LoginMenu', () => {
  let component: LoginMenu;
  let fixture: ComponentFixture<LoginMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginMenu]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
