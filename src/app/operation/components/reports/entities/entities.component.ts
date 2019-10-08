import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation.service';

@Component({
  selector: 'entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {

  constructor(private operation: OperationService) {}

  ngOnInit() {}

  isSelected(entity) {
    return this.operation.selectedEntity &&
      this.operation.selectedEntity.id === entity.id;
  }

  select(entity) {
    this.operation.selectedEntity = entity;
    this.operation.getEntityAttachments(entity.id);
  }
}
