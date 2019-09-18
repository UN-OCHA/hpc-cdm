import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable,zip as observableZip, of } from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent extends CreateOperationChildComponent implements OnInit {
  operationId: any;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    public createOperationService: CreateOperationService,
    private activatedRoute: ActivatedRoute) {
      super(createOperationService, api);
    }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationId = params.id;
      }
    });
  }

  addEntry() {
    const EMPTY_ATTACHMENT = {
      opAttachmentPrototypeId:this.createOperationService.operation.opAttachmentPrototypes[0].id,
      objectId: this.createOperationService.operation.id,
      objectType: 'operation',
      opAttachmentVersion:{
        customReference: '',
        value :{
          name: '',
          file: ''
        }
      }
    };
    this.createOperationService.operation.opAttachments.push(EMPTY_ATTACHMENT)
  }

  isLastEntryNew() {
    const lastEntry = this.createOperationService.operation.opAttachments[this.createOperationService.operation.opAttachments.length - 1];
    return lastEntry && lastEntry.id === null;
  }

  public delete(attachment:any) {
    this.api.deleteOperationAttachment(attachment.id).subscribe(response => {
      if (response.status === 'ok') {
        const index = this.createOperationService.operation.opAttachments.map(function(o) { return o.id; }).indexOf(attachment.id);
        this.createOperationService.operation.opAttachments.splice(index, 1);
        return this.toastr.warning('Attachment removed.', 'Attachment removed');
      }
    });
  }

  public save (): Observable<any> {
    if (this.createOperationService.operation.opAttachments && this.createOperationService.operation.opAttachments.length) {
      const postSaveObservables = [];
      this.createOperationService.operation.opAttachments.forEach(attachment => {
        postSaveObservables.push(
          this.api.saveOperationAttachment(attachment, this.createOperationService.operation.id));
      });

      return observableZip(
        ...postSaveObservables
      ).pipe(map((results) => {
          this.createOperationService.operation.opAttachments = results;
          return {
            stopSave: true
          };
      }));
    } else {
      return of({stopSave:true});
    }
  }
}
