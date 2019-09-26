import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingWindowListComponent } from './reporting-window-list.component';

describe('ReportingWindowListComponent', () => {
  let component: ReportingWindowListComponent;
  let fixture: ComponentFixture<ReportingWindowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingWindowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingWindowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
