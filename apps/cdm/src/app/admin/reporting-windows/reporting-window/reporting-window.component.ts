import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';

const TITLES = {
  'add': 'New Reporting Window',
  'edit': 'Edit Reporting Window'
}

@Component({
  selector: 'reporting-window',
  templateUrl: './reporting-window.component.html'
})
export class ReportingWindowComponent implements OnInit {
  titles;
  mode$ = this.modeService.mode$;
  reportingWindow$ = this.appService.reportingWindow$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private modeService: ModeService) {
    this.titles = TITLES;
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.appService.loadReportingWindow(params.id);
    });
  }
}
