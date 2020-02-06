import { Component, OnInit } from '@angular/core';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'entity-attachments-header',
  templateUrl: './entity-attachments-header.component.html',
  styleUrls: ['./entity-attachments-header.component.scss']
})
export class EntityAttachmentsHeaderComponent implements OnInit {
  entities$;
  
  constructor(private operation: OperationService) {
    this.entities$ = this.operation.entities$;
  }

  ngOnInit() {
  }

  select(entity) {
    this.operation.selectedEntity = entity;
  }

  isSelected(entity) {
    return this.operation.selectedEntity &&
      this.operation.selectedEntity.id == entity.id;
  }
}
