import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsTemperatureComponent } from './ss-temperature.component';

describe('SsTemperatureComponent', () => {
  let component: SsTemperatureComponent;
  let fixture: ComponentFixture<SsTemperatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsTemperatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
