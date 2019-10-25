import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { AttachmentPrototype } from 'app/shared/services/operation/operation.models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listattachmentproto',
  templateUrl: './listAttachmentPrototype.component.html',
  styleUrls: [ './listAttachmentPrototype.component.scss' ]
})
export class ListAttachmentPrototypeComponent implements OnInit {
  prototypes: AttachmentPrototype[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private operation: OperationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.loadAttachmentPrototypes(params.id);
    });

    this.operation.attachmentPrototypes$.subscribe(protos => {
      this.prototypes = protos;
    });
  }
}
