import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';

const TITLES = {
  'add': 'New Entity Prototype',
  'edit': 'Edit Entity Prototype',
  'list': 'Entity Prototypes'
}

@Component({
  selector: 'entity-prototypes',
  templateUrl: './entities.component.html'
})
export class EntitiesComponent implements OnInit {
  id;
  title: string;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
<<<<<<< HEAD
    private appService: AppService){}
=======
    private operationService: OperationService){
    this.id = this.operationService.id;
  }
>>>>>>> cdm-dev

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    });
  }
}
