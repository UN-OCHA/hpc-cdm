import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'entity-attachments',
  templateUrl: './entity-attachments.component.html',
  styleUrls: ['./entity-attachments.component.scss']
})
export class EntityAttachmentsComponent implements OnInit {
  entities$ = this.appService.entities$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService,
    private appService: AppService){}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(parentParams => {
      this.activatedRoute.params.subscribe(params => {
        this.modeService.mode = 'edit';
        this.appService.loadEntities(parentParams.id, params.entityId);
      });
    });
    // TODO vimago
    // this.operation.entities$.subscribe(entities => {
    //   if(entities.length) {
    //     this.operation.selectedEntity = entities[0];
    //   }
    // })
  }
}
