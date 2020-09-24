import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsBookshelfDatasetComponent } from './ss-bookshelf-dataset.component';

describe('SsBookshelfDatasetComponent', () => {
  let component: SsBookshelfDatasetComponent;
  let fixture: ComponentFixture<SsBookshelfDatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsBookshelfDatasetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsBookshelfDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
