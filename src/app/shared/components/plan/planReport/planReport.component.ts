
import { Component, OnInit } from '@angular/core';
import { combineLatest as observableCombineLatest,  ReplaySubject } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ReportsService } from 'app/shared/services/reports.service';

@Component({
  selector: 'app-plan-report',
  templateUrl: './planReport.component.html',
  styleUrls: ['./planReport.component.scss']
})

export class PlanReportComponent  implements OnInit {

  public plan: any;
  public filterByStatus = [];
  public filtersByField = [];
  public groupBy = [];
  public groupBySelected = 'workflowStatus';
  public filterSelectedStatusArray = [];
  public filterSelectedFields = {};
  private _dataUpdateSubject = new ReplaySubject<any>();
  public dataUpdatedObservable$ = this._dataUpdateSubject.asObservable();

  private id: number;

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private router: Router,
    private location: Location,
  ) {
    this.filterByStatus = this.reportsService.filterByStatus;
    this.filtersByField = [];
    this.groupBy = this.reportsService.groupBy;
  }

  ngOnInit() {
    observableCombineLatest(
      this.route.params,
      this.route.queryParams,
      (params, queryParams) => ({ params, queryParams }))
    .subscribe(ap => {
      this.id = +ap.params['id'];
      if (ap.queryParams['filterByStatus']) {
        this.filterSelectedStatusArray = ap.queryParams['filterByStatus'].split(',');
      }

      if (this.id && this.id !== NaN) {
        this.reportsService.getPlanAndProcedure(this.id, this.filterSelectedStatusArray)
          .subscribe(({plan, procedure, groupBy}) => {
            this.groupBy = groupBy;
            this.plan = plan;
            this.plan.procedure = procedure;

            this.filtersByField = this.reportsService.fields;
            this.filterByStatus = this.reportsService.filterByStatus;

            if (!this.filterSelectedStatusArray) {
              this.filterSelectedStatusArray = this.filterByStatus
                                                      .filter(filter => filter.selected)
                                                      .map(filter => filter.key);
            }
          });
      }
    });
  }

  public updateGroupBy () {
    this._dataUpdateSubject.next({
      groupBy: this.groupBySelected
    });
  }

  // TODO: this is re-used code from
  // planReportProjectSummaryByGroup.component.ts.
  // Fix re-use? Also this wrapping in `getFilterOnFields` is
  // meant to preserve the `this` in this function. There has
  // got to be a better way?
  public filterOnFields (selectedObjects) {
    const filterSelectedFields = this.reportsService.turnFieldsIntoKeyValueOject(selectedObjects);

    this._dataUpdateSubject.next({
      filterByFields: filterSelectedFields
    });
  }

  public getFilterOnFields () {
    return (event) => {
      return this.filterOnFields(event);
    }
  }

  public updateStatuses (selectedObjects) {
    this.filterSelectedStatusArray = selectedObjects.map(o => o.key);
    this._dataUpdateSubject.next({
      filterByStatus: this.filterSelectedStatusArray
    });

    const url = this
      .router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {filterByStatus: this.filterSelectedStatusArray.join(',')}
      })
      .toString();

    this.location.replaceState(url);
  }
}
