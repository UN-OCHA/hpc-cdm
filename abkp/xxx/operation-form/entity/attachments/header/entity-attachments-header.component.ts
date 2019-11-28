import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';

@Component({
  selector: 'entity-attachments-header',
  templateUrl: './entity-attachments-header.component.html',
  styleUrls: ['./entity-attachments-header.component.scss']
})
export class EntityAttachmentsHeaderComponent implements OnInit {

  constructor(private operation: OperationService) {}

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
