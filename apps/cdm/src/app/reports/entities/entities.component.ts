import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private operationService: OperationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const entityId = params.entityId;
      if(entityId) {
        this.operationService.loadEntities(entityId, this.operationService.id);
      }
    })

    this.operationService.entityAttachments$.subscribe(as => {
      console.log(as)
    })

    this.operationService.selectedEntity$.subscribe(entity => {
      if(entity) {
        this.operationService.loadEntityAttachments(entity.id);
      }
    });
  }
}
