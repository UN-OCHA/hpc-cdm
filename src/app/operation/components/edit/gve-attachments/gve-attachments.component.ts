import { Component, OnInit } from '@angular/core';

import { Observable,zip as observableZip } from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';

@Component({
  selector: 'gve-attachments',
  templateUrl: './gve-attachments.component.html',
  styleUrls: ['./gve-attachments.component.scss']
})
export class GveAttachmentsComponent extends CreateOperationChildComponent implements OnInit {
  gveId: any;
  attachments = [];
  viewingGoverningEntityIdx = 0;

  constructor(
    public createOperationService: CreateOperationService,
    public api: ApiService
  ) {
    super(createOperationService, api);
  }


  ngOnInit() {
    if (this.createOperationService.operation.opGoverningEntities && this.createOperationService.operation.opGoverningEntities.length) {
      this.attachments = this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx].opAttachments || [];

    } else {
      this.attachments = [];
    }
  }

  public refreshList(entry:any) {
    if (this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx].opAttachments) {
      this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx].opAttachments.push(entry);
    } else {
      this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx].opAttachments = [entry];

    }
  }

  public selectNewGoverningEntity(idx:any) {
    this.viewingGoverningEntityIdx = idx;
    this.attachments = this.createOperationService.operation.opGoverningEntities[idx].opAttachments|| [];
  }

  addEntry(gve:any) {
    const EMPTY_ATTACHMENT = {
      opAttachmentPrototypeId:this.createOperationService.operation.opAttachmentPrototypes[0].id,
      objectId: gve.id,
      objectType: 'opGoverningEntity',
      opAttachmentVersion:{
        customReference: '',
        value :{
          name: '',
          file: ''
        }
      }
    };
    this.attachments.push(EMPTY_ATTACHMENT);
  }

  public save (): Observable<any> {
    const postSaveObservables = [];
    this.attachments.forEach(attachment => {
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
