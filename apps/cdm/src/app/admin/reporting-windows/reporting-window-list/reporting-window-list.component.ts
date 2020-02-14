import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
<<<<<<< HEAD
import { AppService, ModeService } from '@hpc/core';
=======
import { Router } from '@angular/router';
// import * as _ from 'lodash';
// import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService, ModeService } from '@hpc/core';
>>>>>>> cdm-dev


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
<<<<<<< HEAD
=======
  public loading = false;

  public currentPage = 1;
  public page =[];
  public originalPage = [] ;

>>>>>>> cdm-dev
  public options: any;
  public searchOptions: any;
  public results: any;
<<<<<<< HEAD
=======
  filterOptions: any = [
    { label: 'Select', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed'},
    { label: 'Completed', value: 'completed'},
    { label: 'Not yet Opened', value: 'notYetOpen'}
  ];

>>>>>>> cdm-dev
  typeaheadNoResults = false;
  working = false;
  
  reportingWindows$ = this.appService.reportingWindows$;

  constructor(
    private modeService: ModeService,
<<<<<<< HEAD
    private appService: AppService) {
  }

  ngOnInit() {
    this.modeService.mode = 'list';
    this.appService.loadReportingWindows();
  }
=======
    private api: ApiService,
    private router: Router) {
    //  console.log(this.router.getCurrentNavigation().extras.state.searchText);
    }

  ngOnInit() {
    this.modeService.mode = 'list';

    this.results = [];
    this.working = true;

    let options = { };//scopes: 'entityPrototypes,operationVersion'};
    //let options = { scopes: 'entityPrototypes,planVersion'};

    this.searchOptions = options;

    this.loading = true;

    this.api.getAllReportingWindows()
      .subscribe(results => {
        this.page = results;
        this.originalPage = results;
        this.loading = false;
        //this.page = this.results.slice(0,10);
        this.working = false;
      });
  }

  filterChange(status:string) {
    this.page = this.originalPage;
    this.page = this.page.filter(p => p.status === status);
  }

  // pageChanged(event: PageChangedEvent): void {
  //   const startItem = (event.page - 1) * event.itemsPerPage;
  //   const endItem = event.page * event.itemsPerPage;
  //   this.page = this.results.slice(startItem, endItem);
  // }

>>>>>>> cdm-dev
}
// let options = { };//scopes: 'entityPrototypes,operationVersion'};
// this.searchOptions = options;

// <div *ngIf="page.length <= 0">
//   <p>You currently have no reporting windows.</p>
// </div>
