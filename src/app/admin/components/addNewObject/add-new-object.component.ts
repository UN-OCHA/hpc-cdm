import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-add-new-object',
  templateUrl: './add-new-object.component.html',
  styleUrls: ['./add-new-object.component.scss']
})
export class AddNewObjectComponent implements OnInit {

  public newObjectForm;
  public toggled = false;

  @Input() objectType: string;
  @Input() parentObjectId: number;
  @Input() redirect = true;

  @Output() afterSubmit = new EventEmitter();

  constructor(private service: QuestionService) { }

  ngOnInit() {
    this.newObjectForm = this.service.transformAPIObjectIntoQuestion(this.objectType, {
      parentObjectId: this.parentObjectId
    }, true);
  }

  afterSubmitEvent(data) {
    this.afterSubmit.emit(data);

    this.newObjectForm = this.service.transformAPIObjectIntoQuestion(this.objectType, {
      parentObjectId: this.parentObjectId
    }, true)
  }
}
