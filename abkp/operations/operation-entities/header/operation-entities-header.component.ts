import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Entity } from '@hpc/data';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'operation-entities-header',
  templateUrl: './operation-entities-header.component.html',
  styleUrls: ['./operation-entities-header.component.scss']
})
export class OperationEntitiesHeaderComponent implements OnInit {

  constructor(private operation: OperationService){}

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.operation.entities, event.previousIndex, event.currentIndex);
  }

  selectEntity(entity: Entity) {
    this.operation.selectedEntity = entity
  }

  isSelectedEntity(entity: Entity) {
    return this.operation.selectedEntity &&
      this.operation.selectedEntity.id == entity.id;
  }
}
