import { Component, OnInit } from '@angular/core';

import { ModeService } from '@hpc/core';
import { OperationService } from '@cdm/core';

const TITLES = {
  'list': 'Plans',
  'add': 'Add Plan',
  'edit': 'Edit Plan'
};

@Component({
  selector: 'plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  title: string;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title =  TITLES[mode];
    });
  }
}
