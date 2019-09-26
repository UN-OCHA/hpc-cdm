import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingWindowWorkflowComponent } from './reporting-window-workflow.component';

describe('ReportingWindowWorkflowComponent', () => {
  let component: ReportingWindowWorkflowComponent;
  let fixture: ComponentFixture<ReportingWindowWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingWindowWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingWindowWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
