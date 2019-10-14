import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/shared/services/operation/operation.service';

@Component({
  selector: 'operation-entities',
  templateUrl: './operation-entities.component.html',
  styleUrls: ['./operation-entities.component.scss']
})
export class OperationEntitiesComponent implements OnInit {

  constructor(
    private operation: OperationService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.loadEntities(params.entityPrototypeId, params.id);
    });
    this.operation.entities$.subscribe(entities => {
      if(entities.length === 0) {
        this.addEntity();
      }
    })
  }

  addEntity() {
    this.operation.mode = 'ADD_ENTITY'
  }

  isAddButtonEnabled() {
    return this.operation.mode !== 'ADD_ENTITY' ||
      this.operation.selectedEntity;
  }
}
