import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowJsonAsFormComponent } from './show-json-as-form.component';

describe('ShowJsonAsFormComponent', () => {
  let component: ShowJsonAsFormComponent;
  let fixture: ComponentFixture<ShowJsonAsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowJsonAsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowJsonAsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
