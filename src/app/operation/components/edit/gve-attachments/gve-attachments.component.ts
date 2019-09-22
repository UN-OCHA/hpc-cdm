import { Component, OnInit } from '@angular/core';

import { Observable,zip as observableZip } from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';
import { Attachment } from 'app/operation/models/view.operation.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'gve-attachments',
  templateUrl: './gve-attachments.component.html',
  styleUrls: ['./gve-attachments.component.scss']
})
export class GveAttachmentsComponent extends CreateOperationChildComponent implements OnInit {
  gveId: any;
  attachments = [];
  viewingGoverningEntityIdx = 0;
  currentGve: any;

  constructor(
    public createOperationService: CreateOperationService,
    private toastr: ToastrService,
    public api: ApiService
  ) {
    super(createOperationService, api);
  }


  ngOnInit() {
    if (this.createOperationService.operation.opGoverningEntities && this.createOperationService.operation.opGoverningEntities.length) {
      this.currentGve = this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx];
    }
  }

  public refreshList() {
  }

  public selectNewGoverningEntity(idx:any) {
    this.viewingGoverningEntityIdx = idx;
    this.currentGve = this.createOperationService.operation.opGoverningEntities[this.viewingGoverningEntityIdx];
  }

  public delete(attachment:any) {
    this.api.deleteOperationAttachment(attachment.id).subscribe(response => {
      if (response.status === 'ok') {
        const index = this.currentGve.opAttachments.map(function(o) { return o.id; }).indexOf(attachment.id);
        this.currentGve.opAttachments.splice(index, 1);
        return this.toastr.warning('Attachment removed.', 'Attachment removed');
      }
    });
  }
  addEntry() {
    let newAttachment = new Attachment({
      id:null,
      opAttachmentPrototypeId:this.createOperationService.operation.opAttachmentPrototypes[0].id,
      objectId: this.currentGve.id,
      objectType: 'opGoverningEntity',
      opAttachmentVersion:{
        customReference: '',
        value :{
          name: '',
          file: ''
        }
      }
    });
    this.currentGve.opAttachments.push(newAttachment);
  }

  public save (): Observable<any> {
    const postSaveObservables = [];
    this.createOperationService.operation.opGoverningEntities.forEach(gve => {
      gve.opAttachments.forEach((attachment:any) => {
      postSaveObservables.push(
        this.api.saveOperationAttachment(attachment, this.createOperationService.operation.id));
      });
    });

    return observableZip(
      ...postSaveObservables
    ).pipe(map((results:Array<Attachment>) => {
      this.createOperationService.operation.opGoverningEntities.forEach(gve => {
        gve.opAttachments = results.filter((attachment:any) => attachment.objectId === gve.id);
      });
      return {
        stopSave: true
      };
    }));
  }
}
