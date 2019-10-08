import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/shared/services/operation.service';

@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent implements OnInit {
  constructor(
    public operation: OperationService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.getAttachments(params.id, 'EDIT_OPERATION_ATTACHMENTS');
    });
    this.operation.attachments$.subscribe(attachments => {
      if(attachments.length === 0) {
        this.addForm();
      }
    });
  }

  addForm() {
    this.operation.mode = 'ADD_OPERATION_ATTACHMENT';
  }
}
