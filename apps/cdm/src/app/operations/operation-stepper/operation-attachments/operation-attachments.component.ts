import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent implements AfterViewInit, OnInit {
  loading = false;
<<<<<<< HEAD
  attachments$ = this.appService.operationAttachments$;
  mode$ = this.modeService.mode$;

  constructor(
    private appService: AppService,
    private modeService: ModeService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.loading = true;
    this.activatedRoute.parent.params.subscribe(params => {
      this.modeService.mode = 'edit';
      this.appService.loadAttachments(params.id);
    });
=======
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
>>>>>>> cdm-dev
  }

  ngAfterViewInit() {
    this.attachments$.subscribe(attachments => {
      setTimeout(() => {
        this.loading = false;
        if(attachments.length === 0) {
          this.addForm();
        }
      })
    });
  }

  addForm() {
<<<<<<< HEAD
    // this.operation.mode = 'ADD_OPERATION_ATTACHMENT';
    this.modeService.mode = 'add';
=======
    this.mode = 'ADD_OPERATION_ATTACHMENT';
>>>>>>> cdm-dev
  }
}
