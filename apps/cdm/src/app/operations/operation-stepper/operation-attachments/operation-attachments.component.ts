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
    // this.operation.mode = 'ADD_OPERATION_ATTACHMENT';
    this.modeService.mode = 'add';
  }
}
