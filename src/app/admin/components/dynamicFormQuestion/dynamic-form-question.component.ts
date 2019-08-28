import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../../models';

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html'
})
export class DynamicFormQuestionComponent implements OnInit {
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  @Input() disabled: boolean;

  public jsonForm: FormGroup;

  constructor() {}

  ngOnInit () {
    //
    // if (this.question instanceof TextareaQuestion && this.question.isJSON) {
    //   console.log('this.question.value', this.question.value);
    //   this.jsonInputs = this.jsonService.convertQuestion(this.question.value);
    //   this.jsonForm = this.jsonService.toFormGroup(this.jsonInputs);
    //   console.log('this.jsonForm', this.jsonInputs, this.jsonForm);
    // }

  }

  get isValid() {
    return this.form.controls[this.question.key].valid;
  }
}
