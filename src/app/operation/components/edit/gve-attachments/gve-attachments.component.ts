import { Component, OnInit } from '@angular/core';
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

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService
  ) {
    super(createOperationService, apiService);
  }


  ngOnInit() {
  }

  addEntry() {

    const EMPTY_ATTACHMENT = {
      opAttachmentPrototypeId:this.createOperationService.operation.opAttachmentPrototypes[0].id,
      objectId: this.createOperationService.operation.id,
      objectType: 'gve',
      opAttachmentVersion:{
        customReference: '',
        value :{
          name: '',
          file: ''
        }
      }
    };
    this.attachments.push(EMPTY_ATTACHMENT)
  }

}
