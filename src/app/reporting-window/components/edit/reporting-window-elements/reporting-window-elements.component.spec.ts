import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingWindowElementsComponent } from './reporting-window-elements.component';

describe('ReportingWindowElementsComponent', () => {
  let component: ReportingWindowElementsComponent;
  let fixture: ComponentFixture<ReportingWindowElementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingWindowElementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingWindowElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
