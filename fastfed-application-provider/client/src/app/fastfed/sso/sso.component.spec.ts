import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoComponent } from './sso.component';

describe('UserProfileComponent', () => {
  let component: SsoComponent;
  let fixture: ComponentFixture<SsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
