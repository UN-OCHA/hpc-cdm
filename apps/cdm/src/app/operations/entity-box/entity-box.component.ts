import { Component, OnInit, Input } from '@angular/core';
import { Entity } from '@hpc/data';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'entity-box',
  templateUrl: './entity-box.component.html',
  styleUrls: ['./entity-box.component.scss']
})
export class EntityBoxComponent implements OnInit {
  @Input() entity: Entity;
  selected: boolean;

  constructor(private operation: OperationService) {}

  ngOnInit() {
    this.operation.selectedEntity$.subscribe(xentity => {
      this.selected = xentity && xentity.id === this.entity.id;
    });
  }

  select() {
    this.operation.selectedEntity = this.entity;
  }
}
