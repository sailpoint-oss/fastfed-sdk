import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelyingPartyListComponent } from './relying-party-list.component';

describe('RelyingPartyListComponent', () => {
  let component: RelyingPartyListComponent;
  let fixture: ComponentFixture<RelyingPartyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelyingPartyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelyingPartyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
