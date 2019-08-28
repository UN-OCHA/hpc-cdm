import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  encapsulation: ViewEncapsulation.None
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

  public pagination: any;
  public savedSearches = [];

  public projectSearchSubscription;

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
    this.searchOperations();
  }

  public searchOperations (filter?: string) {
    delete this.query.date;

    this.query.date = {
      start: moment().startOf('year').format('YYYY-MM-DD'),
      end: moment().add(1, 'y').endOf('year').format('YYYY-MM-DD')
    }

    this.doSearch();
  }

  public resetSearch () {
    this.pagination = null;
  }

  public doSearch(passedObject?) {
    if (this.projectSearchSubscription) {
      this.projectSearchSubscription.unsubscribe();
    }
    this.cdmResults = [];
    this.working = true;

    let options = { scopes: 'entityPrototypes,planVersion'}; // `options` is the local object that contains the search options.

    // we assign `options` to searchOptions to pass it to child components.
    this.searchOptions = options;

    this.loading = true;

    this.projectSearchSubscription = this.apiService.getPlans(options)
      .subscribe(results => {
        console.log(results);
        this.cdmResults = results;
        this.loading = false;

        this.processSearchResults(this.cdmResults);

        this.pagination = results.pagination;

        this.working = false;
      });
  }

  private processSearchResults (cdmResults) {
    cdmResults.forEach(cdm => {
      //console.log(cdm);
    });
  }

  private getRelevantYear () {
    const thisMoment = moment();
    if (thisMoment.month() >= 8) { // remember it's 0 based.
      return thisMoment.add(1, 'year').year()
    } else {
      return thisMoment.year();
    }
  }

}
