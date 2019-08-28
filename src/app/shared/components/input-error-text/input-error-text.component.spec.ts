import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputErrorTextComponent } from './input-error-text.component';

describe('InputErrorTextComponent', () => {
  let component: InputErrorTextComponent;
  let fixture: ComponentFixture<InputErrorTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputErrorTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputErrorTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
