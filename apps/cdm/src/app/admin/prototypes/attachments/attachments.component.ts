import { Component, OnInit } from '@angular/core';
import { ModeService } from '@hpc/core';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';

const TITLES = {
  'add': 'New Attachment Prototype',
  'edit': 'Edit Attachment Prototype',
  'list': 'Attachment Prototypes'
}

@Component({
  selector: 'attachment-prototypes',
  templateUrl: './attachments.component.html'
})
export class AttachmentsComponent implements OnInit {
  title: string;
  op: Operation;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      console.log(mode)
      this.title = TITLES[mode];
    });
    this.operationService.operation$.subscribe(operation => {
      this.op = operation;
    })
  }
}
