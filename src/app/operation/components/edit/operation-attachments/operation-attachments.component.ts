import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { OperationService } from 'app/operation/services/operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';


@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent extends CreateOperationChildComponent implements OnInit {
  operationId: any;

  constructor(
    private api: ApiService,
    private operation: OperationService,
    public createOperationService: CreateOperationService,
    private activatedRoute: ActivatedRoute) {
      super(createOperationService, api);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationId = params.id;
        this.operation.getAttachments(this.operationId);
      }
    });
  }

  addEntry() {
    this.operation.attachments.push({id: null, formId: null, formName: ''})
  }

  isLastEntryNew() {
    const list = this.operation.attachments;
    const lastEntry = list && list[list.length - 1];
    return lastEntry && lastEntry.id === null;
  }

  //TODO api unread error otherwise
  dummyOp() {
    this.api.getFile(1);
  }
}
