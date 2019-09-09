import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
})
export class MapWrapperComponent implements OnInit {

  public currentYear: any = this.getRelevantYear();

  public loading = false;

  public emptyQuery = {
    latest: true,
    search: '',
    date: this.currentYear,
    limit: 50,
    searchRepresentation: '',
    searchDate: null,
    order: 'id',
    orderDirection: 'desc'
  }

  public query = _.cloneDeep(this.emptyQuery);

  public activeSidebar = 'history';
  public activeButton = 'myProjects';

  public isClusterLead: boolean | any = false;

  public savedSearches = [];

  public currentPage = 1;
  public page = [];

  public options;
  public searchOptions;

  public cdmResults;

  typeaheadNoResults = false;
  working = false;

  public hideMap = true;

  constructor(
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    delete this.query.date;

    this.query.date = {
      start: moment().startOf('year').format('YYYY-MM-DD'),
      end: moment().add(1, 'y').endOf('year').format('YYYY-MM-DD')
    }

    this.cdmResults = [];
    this.working = true;

    let options = { scopes: 'entityPrototypes,operationVersion'};
    //let options = { scopes: 'entityPrototypes,planVersion'};

    this.searchOptions = options;

    this.loading = true;

    this.apiService.getOperations(options)
    //this.apiService.getPlans(options)
      .subscribe(results => {
        this.cdmResults = results;
        console.log(this.cdmResults);
        this.loading = false;
        //this.processSearchResults(this.cdmResults);

        this.page = this.cdmResults.slice(0,10);

        this.working = false;
      });
  }

  /*private processSearchResults (cdmResults) {
    cdmResults.forEach(cdm => {
      //console.log(cdm);
    });
  }*/

  private getRelevantYear () {
    const thisMoment = moment();
    if (thisMoment.month() >= 8) { // remember it's 0 based.
      return thisMoment.add(1, 'year').year()
    } else {
      return thisMoment.year();
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.page = this.cdmResults.slice(startItem, endItem);
  }

}
