import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';

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
    console.log('333333333333333333333333333333333333333333333333333')
    console.log('333333333333333333333333333333333333333333333333333')
    console.log('333333333333333333333333333333333333333333333333333')

    // this.activatedRoute.parent.params.subscribe(params => {
    //   console.log(params)
    //   if(params.entityId) {
    //     this.operation.loadEntities(params.entityId, params.id);
    //   }
    // });
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
      if(params.entityId) {
        this.operation.loadEntities(params.entityId, this.operation.id);
      }
    });
    // this.operation.entities$.subscribe(entities => {
    //   if(entities.length === 0) {
    //     this.addEntity();
    //   } else {
    //     if(!this.operation.mode) {
    //       this.operation.selectedEntity = entities[entities.length-1];
    //     } else {
    //       this.operation.selectedEntity = entities[0];
    //     }
    //   }
    // })
  }

  addEntity() {
    this.operation.mode = 'ADD_ENTITY'
  }

  isAddButtonEnabled() {
    return this.operation.mode !== 'ADD_ENTITY' ||
      this.operation.selectedEntity;
  }
}
