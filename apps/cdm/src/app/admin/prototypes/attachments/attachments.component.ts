import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';
import { Operation } from '@hpc/data';

@Component({
  selector: 'attachment-prototypes',
  templateUrl: './attachments.component.html'
})
export class AttachmentsComponent implements OnInit {
<<<<<<< HEAD
  mode;
  operation;
  titles = {
    'add': 'New Attachment Prototype',
    'edit': 'Edit Attachment Prototype',
    'list': 'Attachment Prototypes'
  };

  constructor(
    private appService: AppService,
    private modeService: ModeService) {
=======
  title: string;
  op: Operation;
  id;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){
    this.id = this.operationService.id;
>>>>>>> cdm-dev
  }

  ngOnInit() {
    this.appService.operation$.subscribe(operation => {
      this.operation = operation;
    });

    this.modeService.mode$.subscribe(mode => {
<<<<<<< HEAD
      this.mode = mode;
    });
=======
      this.title = TITLES[mode];
    });
    this.operationService.operation$.subscribe(operation => {
      this.op = operation;
      this.id = operation.id;
    })
>>>>>>> cdm-dev
  }

}
