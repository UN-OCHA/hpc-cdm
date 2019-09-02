import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Operation } from 'app/operation/models/view.operation.model';

@Component({
  selector: 'app-create-or-save-buttons',
  templateUrl: './create-or-save-buttons.component.html',
  styleUrls: ['./create-or-save-buttons.component.scss']
})
export class CreateOrSaveButtonsComponent implements OnInit {

  @Input() operation: Operation;
  @Input() operationForm: NgForm;

  @Output() saveOperation = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  public saveOperationClick() {
    this.saveOperation.emit(this.operation);
  }
}
