import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'app-reporting-window-list',
  templateUrl: './reporting-window-list.component.html',
  styleUrls: ['./reporting-window-list.component.scss']
})
export class ReportingWindowListComponent implements OnInit {

  public loading = false;

  public currentPage = 1;
  public page = [];

  public options: any;
  public searchOptions: any;

  public results: any;

  typeaheadNoResults = false;
  working = false;

  constructor(
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.results = [];
    this.working = true;

    let options = { };//scopes: 'entityPrototypes,operationVersion'};
    //let options = { scopes: 'entityPrototypes,planVersion'};

    this.searchOptions = options;

    this.loading = true;

    this.apiService.getAllReportingWindows()
      .subscribe(results => {
        console.log(results);
        this.results = results;
        this.loading = false;

        this.page = this.results.slice(0,10);

        this.working = false;
      });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.page = this.results.slice(startItem, endItem);
  }

}
