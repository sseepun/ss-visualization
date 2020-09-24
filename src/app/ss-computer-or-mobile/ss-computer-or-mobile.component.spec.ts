import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsComputerOrMobileComponent } from './ss-computer-or-mobile.component';

describe('SsComputerOrMobileComponent', () => {
  let component: SsComputerOrMobileComponent;
  let fixture: ComponentFixture<SsComputerOrMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsComputerOrMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsComputerOrMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
