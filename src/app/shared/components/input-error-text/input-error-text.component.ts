import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-input-error-text',
  templateUrl: './input-error-text.component.html',
  styleUrls: ['./input-error-text.component.scss']
})
export class InputErrorTextComponent {

  @Input() parentForm: NgForm;
  @Input() fieldName: string;

  constructor() { }
}
