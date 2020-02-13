import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent implements AfterViewInit, OnInit {
  loading = false;
  attachments$;
  newAttachment;
  mode;

  constructor(
    private operation: OperationService,
    private activatedRoute: ActivatedRoute) {
    this.attachments$ = operation.attachments$;
    this.newAttachment = operation.newAttachment;
    this.mode = operation.mode;
  }

  ngOnInit() {
    this.loading = true;
    // this.activatedRoute.params.subscribe(params => {
      // console.log(params)
      this.operation.loadAttachments(this.operation.id, 'EDIT_OPERATION_ATTACHMENTS');
      this.loading = false;
    // });
  }

  ngAfterViewInit() {
    this.operation.attachments$.subscribe(attachments => {
      setTimeout(() => {
        this.loading = false;
        if(attachments.length === 0) {
          this.addForm();
        }
      })
    });
  }

  addForm() {
    this.mode = 'ADD_OPERATION_ATTACHMENT';
  }
}
