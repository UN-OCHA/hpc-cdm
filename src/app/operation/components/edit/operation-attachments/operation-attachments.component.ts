import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable,zip as observableZip } from 'rxjs';
import {map} from 'rxjs/operators';
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
        console.log(this.createOperationService.operation.opAttachments);
        this.list = this.createOperationService.operation.opAttachments.filter(attachment => attachment.objectType === 'operation');
      }
    });
  }

  addEntry() {
    const EMPTY_ATTACHMENT = {
      //opAttachmentPrototypeId:this.attachmentPrototypeId,
      objectId: this.createOperationService.operation.id,
      opAttachmentVersion:{
        customReference: '',
        value :{
          name: ''
        },
      }
    };
    this.list.push(EMPTY_ATTACHMENT)
  }

  isLastEntryNew() {
    const lastEntry = this.list[this.list.length - 1];
    return lastEntry && lastEntry.id === null;
  }


  public save (): Observable<any> {
    const postSaveObservables = [];
    this.list.forEach(attachment => {
      console.log(attachment);
      postSaveObservables.push(
        this.api.saveOperationAttachment(attachment, this.createOperationService.operation.id));
    });

    return observableZip(
      ...postSaveObservables
    ).pipe(map(() => {
        return {
          stopSave: true
        };
      }));
  }
}
