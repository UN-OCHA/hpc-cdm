import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';

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
  titles;
  mode$ = this.modeService.mode$;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
    private appService: AppService){
    this.titles = TITLES;
  }

  ngOnInit() {
  }
}
