import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'operation-entities',
  templateUrl: './operation-entities.component.html',
  styleUrls: ['./operation-entities.component.scss']
})
export class OperationEntitiesComponent implements OnInit {
  entities$ = this.appService.entities$;
  entityPrototype$ = this.appService.entityPrototype$;
  mode$ = this.modeService.mode$;

  constructor(
    private modeService: ModeService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(parentParams => {
      this.activatedRoute.params.subscribe(params => {
        this.appService.loadEntities(parentParams.id, params.entityId);
      });
    })
    this.entities$.subscribe(entities => {
      if(entities.length === 0) {
        this.addEntity();
      } else {
        // if(this.modeService.mode === 'edit') {
        //   this.operation.selectedEntity = entities[entities.length-1];
        // } else {
        //   this.operation.selectedEntity = entities[0];
        // }
      }
    })
  }

  addEntity() {
    this.modeService.mode = 'add';
  }

  isAddButtonEnabled() {
    // return this.modeService.mode !== 'add' ||
    //   this.appService.selectedEntity;
    return true;
  }
}
