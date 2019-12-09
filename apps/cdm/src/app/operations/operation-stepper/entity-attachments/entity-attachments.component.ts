import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'entity-attachments',
  templateUrl: './entity-attachments.component.html',
  styleUrls: ['./entity-attachments.component.scss']
})
export class EntityAttachmentsComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private operation: OperationService){}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.route = 'EDIT_ENTITY_ATTACHMENTS';
      this.operation.loadEntities(params.entityId, this.operation.id);
    });
    this.operation.entities$.subscribe(entities => {
      if(entities.length) {
        this.operation.selectedEntity = entities[0];
      }
    })
  }
}
