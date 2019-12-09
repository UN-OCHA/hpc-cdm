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
  constructor(
    private operation: OperationService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.loading = true;
    console.log(this.operation.id)
    // this.activatedRoute.params.subscribe(params => {
      // console.log(params)
      this.operation.loadAttachments(this.operation.id, 'EDIT_OPERATION_ATTACHMENTS');
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
    this.operation.mode = 'ADD_OPERATION_ATTACHMENT';
  }
}
