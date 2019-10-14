import { Component, OnInit, Input } from '@angular/core';
import { OperationService, Entity } from 'app/shared/services/operation/operation.service';


@Component({
  selector: 'entity-box',
  templateUrl: './entity-box.component.html',
  styleUrls: ['./entity-box.component.scss']
})
export class EntityBoxComponent implements OnInit {
  @Input() entity: Entity;

  constructor(private operation: OperationService) {}

  ngOnInit() {}

  select() {
    console.log('selecting...............')
    console.log(this.entity)
    this.operation.selectedEntity = this.entity;
  }
}
