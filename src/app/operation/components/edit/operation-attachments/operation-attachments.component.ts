import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';


@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent extends CreateOperationChildComponent implements OnInit {
  public list = [];
  operationId: any;

  constructor(
    private api: ApiService,
    public createOperationService: CreateOperationService,
    private activatedRoute: ActivatedRoute) {
      super(createOperationService, api);
    }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationId = params.id;
        this.api.getOperationAttachments(this.operationId).subscribe(attachments => {
          this.list = attachments;
          this.list.push({id: null, name: ''});
        });
      }
    });
  }

  addEntry() {
    this.list.push({id: null, name: ''})
  }

  isLastEntryNew() {
    const lastEntry = this.list[this.list.length - 1];
    return lastEntry && lastEntry.id === null;
  }
}
