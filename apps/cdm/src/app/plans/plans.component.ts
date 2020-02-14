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
<<<<<<< HEAD
  titles;
  mode$ = this.modeService.mode$;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
    private appService: AppService){
    this.titles = TITLES;
=======
  id;
  title: string;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){
    this.id = operationService.id;
>>>>>>> cdm-dev
  }

  ngOnInit() {
  }
}
