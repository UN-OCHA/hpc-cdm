import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
// import { ApiService } from '@hpc/core';
import { ReportingWindow } from '@hpc/data';

@Component({
  selector: 'reporting-window-states',
  templateUrl: './reporting-window-states.component.html',
  styleUrls: [ './reporting-window-states.component.scss' ],
})
export class ReportingWindowStatesComponent implements OnInit {
  reportingWindow: ReportingWindow;

  constructor(
    // private api: ApiService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      // TODO what service?
      // this.api.getReportingWindow(params.id).subscribe(rw => {
      //   rw.name = 'RW Name';
      //   this.reportingWindow = rw;
      // });
    });
  }

}
