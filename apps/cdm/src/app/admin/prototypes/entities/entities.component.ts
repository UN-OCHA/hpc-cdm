import { Component, OnInit } from '@angular/core';
import { ModeService } from '@hpc/core';
import { OperationService } from '@cdm/core';

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

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){
    this.id = this.operationService.id;
  }

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    });
  }
}
