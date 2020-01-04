import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';
import { Operation } from '@hpc/data';

@Component({
  selector: 'attachment-prototypes',
  templateUrl: './attachments.component.html'
})
export class AttachmentsComponent implements OnInit {
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
  }

  ngOnInit() {
    this.appService.operation$.subscribe(operation => {
      this.operation = operation;
    });

    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }

}
