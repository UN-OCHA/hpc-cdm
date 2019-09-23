import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingWindowDetailComponent } from './reporting-window-detail.component';

describe('ReportingWindowDetailComponent', () => {
  let component: ReportingWindowDetailComponent;
  let fixture: ComponentFixture<ReportingWindowDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingWindowDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingWindowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
