import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataQueueComponent } from './data-queue.component';

describe('DataQueueComponent', () => {
  let component: DataQueueComponent;
  let fixture: ComponentFixture<DataQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
