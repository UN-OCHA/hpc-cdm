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
  title: string;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
    private appService: AppService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    });
  }
}
