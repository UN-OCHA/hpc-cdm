import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReportingWindowComponent } from './create-reporting-window.component';

describe('CreateReportingWindowComponent', () => {
  let component: CreateReportingWindowComponent;
  let fixture: ComponentFixture<CreateReportingWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateReportingWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateReportingWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
