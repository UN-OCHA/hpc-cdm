import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/operation/services/operation.service';

@Component({
  selector: 'gve-attachments',
  templateUrl: './gve-attachments.component.html',
  styleUrls: ['./gve-attachments.component.scss']
})
export class GveAttachmentsComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private operation: OperationService){}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.route = 'EDIT_ENTITY_ATTACHMENTS';
      this.operation.getEntities(params.entityPrototypeId, params.id);
    });
  }
}
