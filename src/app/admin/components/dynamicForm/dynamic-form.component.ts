import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { QuestionBase } from '../../models/question-base';
import { QuestionControlService } from '../../services/question-control.service';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [ QuestionControlService, QuestionService ]
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() questions: QuestionBase<any>[] = [];
  @Input() objectType: string;
  @Input() objectId: number;
  @Input() redirect = true;
  @Input() parentKey: string;

  @Output() afterSubmit = new EventEmitter<any>();

  form: FormGroup;
  payLoad = '';

  constructor(
    private qcs: QuestionControlService,
    private questionService: QuestionService,
    private router: Router
  ) {  }

  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.questions);
  }

  ngOnChanges () {
    this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    if (this.objectId) {
      this.questionService.updateObject(this.objectType, this.objectId, this.form.value)
        .subscribe((data) => {
          // We can't do this because form.value is constant / read-only.
          // this.form.value = data;
        });
    } else {
      this.questionService.createObject(this.objectType, this.form.getRawValue())
        .subscribe((data) => {
          if (this.redirect) {
            this.router.navigate(['admin', this.objectType, data.id]);
          } else {
            this.afterSubmit.emit({data, key: this.objectType});
          }
        })
    }
  }

  onDelete () {
    const confirmation = confirm('Are you sure?');
    if (confirmation) {
      this.questionService.deleteObjectById(this.objectType, this.objectId)
        .subscribe(() => {
          // redirect
          if (this.redirect) {
            this.router.navigate(['admin', this.objectType]);

          } else {
            this.afterSubmit.emit({
              'key': this.objectType,
              'eventType': 'delete',
              'data': this.objectId})
          }
        })
    }
  }
}
