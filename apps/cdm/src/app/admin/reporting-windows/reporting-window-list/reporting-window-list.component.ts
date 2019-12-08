import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
// import * as _ from 'lodash';
// import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService } from '@hpc/core';
import { ReportingWindowsService } from '../reporting-windows.service';

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
  public loading = false;

  public currentPage = 1;
  public page = [];

  public options: any;
  public searchOptions: any;

  public results: any;

  typeaheadNoResults = false;
  working = false;

  constructor(
    private service: ReportingWindowsService,
    private api: ApiService) {}

  ngOnInit() {
    this.service.mode = 'list';

    this.results = [];
    this.working = true;

    let options = { };//scopes: 'entityPrototypes,operationVersion'};
    //let options = { scopes: 'entityPrototypes,planVersion'};

    this.searchOptions = options;

    this.loading = true;

    this.api.getAllReportingWindows()
      .subscribe(results => {
        this.results = results;
        this.loading = false;
        this.page = this.results.slice(0,10);
        this.working = false;
      });
  }

  // pageChanged(event: PageChangedEvent): void {
  //   const startItem = (event.page - 1) * event.itemsPerPage;
  //   const endItem = event.page * event.itemsPerPage;
  //   this.page = this.results.slice(startItem, endItem);
  // }

}

// <div *ngIf="loading" class="project-page-loader">
//   <i class="fa fa-circle-o-notch fa-spin"></i>
// </div>
