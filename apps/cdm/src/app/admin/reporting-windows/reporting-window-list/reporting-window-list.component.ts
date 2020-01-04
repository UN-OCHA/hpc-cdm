import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { AppService, ModeService } from '@hpc/core';


@Component({
  selector: 'reporting-windows',
  templateUrl: './reporting-window-list.component.html',
  styleUrls: ['./reporting-window-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ReportingWindowListComponent implements OnInit {
  expandedElement: any | null;
  columnsToDisplay = ['name', 'actions'];
  public options: any;
  public searchOptions: any;
  public results: any;
  typeaheadNoResults = false;
  working = false;
  
  reportingWindows$ = this.appService.reportingWindows$;

  constructor(
    private modeService: ModeService,
    private appService: AppService) {
  }

  ngOnInit() {
    this.modeService.mode = 'list';
    this.appService.loadReportingWindows();
  }
}
// let options = { };//scopes: 'entityPrototypes,operationVersion'};
// this.searchOptions = options;

// <div *ngIf="page.length <= 0">
//   <p>You currently have no reporting windows.</p>
// </div>
