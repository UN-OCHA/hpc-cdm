
import {combineLatest as observableCombineLatest,  ReplaySubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

// TODO: do we have to import this pipe cause it's already imported
// in SharedModule.
import { UnCamelCasePipe } from 'app/shared/pipes/un-camel-case.pipe';
import { ApiService } from 'app/shared/services/api/api.service';
import { ExportService } from 'app/shared/services/export.service';
import { ReportsService } from 'app/shared/services/reports.service';


@Component({
  selector: 'app-plan-report-project-summary-by-group',
  templateUrl: './planReportProjectSummaryByGroup.component.html',
  styleUrls: ['./planReportProjectSummaryByGroup.component.scss'],
  providers: [UnCamelCasePipe]
})
export class PlanReportProjectSummaryByGroupComponent implements OnInit {

  private id: number;
  private groupByParam: string;
  public groupBy: any[];
  private groupId: number;
  private plan: any;
  private nameKey: string;
  public filterByStatus: any[];
  public filterByFields = [];
  public group: any;
  public filterSelectedArray = [];
  private _dataUpdateSubject = new ReplaySubject<any>();
  public dataUpdatedObservable$ = this._dataUpdateSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private unCamelCasePipe: UnCamelCasePipe,
    private exportService: ExportService,
    private reportsService: ReportsService,
    private location: Location
  ) {
    this.filterByStatus = this.reportsService.filterByStatus;
    this.groupBy = this.reportsService.groupBy;
    // this.filterSelectedArray = this.filterBy.filter(filter => filter.selected).map(filter => filter.key)
  }

  ngOnInit() {
    const obsCombined = observableCombineLatest(
      this.route.params,
      this.route.queryParams,
      (params, queryParams) => ({ params, queryParams }));

    obsCombined.subscribe(ap => {
      this.id = +ap.params['id'];
      this.groupByParam = ap.params['groupBy'];
      this.groupId = ap.params['groupId'];
      if (ap.queryParams['filterBy']) {
        this.filterSelectedArray = ap.queryParams['filterBy'].split(',');
      }

      if (this.id && this.groupBy && this.groupId) {
        this.reportsService.getPlanAndProcedure(this.id, this.filterSelectedArray)
          .subscribe(({plan, procedure}) => {
            this.plan = plan;
            this.plan.procedure = procedure;
            this.filterByFields = this.reportsService.fields;

            this.filterByStatus = this.reportsService.filterByStatus;
            this.filterSelectedArray = this.filterByStatus
                                            .filter(filter => filter.selected)
                                            .map(filter => filter.key);

            this.updateContent();

            this.dataUpdatedObservable$
              .subscribe(data => {
                this.updateContent();
            })
          });
      }
    });
  }

  public updateStatuses (selectedObjects) {
    this.filterSelectedArray = selectedObjects.map(o => o.key);

    this.updateContent();

    const url = this
      .router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {filterBy: this.filterSelectedArray.join(',')}
      })
      .toString();

    this.location.replaceState(url);
  }

  // TODO: this is re-used code from planReport.component.ts.
  // Fix re-use? Also this wrapping in `getFilterOnFields` is
  // meant to preserve the `this` in this function. There has
  // got to be a better way?
  public filterOnFields (selectedObjects) {
    const filterSelectedFields = {};
    for (const field of selectedObjects) {
      if (field.selected) {
        filterSelectedFields[field.name] = field.filters
                                                      .filter(filter => filter.selected)
                                                      .map(filter => filter.key);
      }
    }

    this.updateContent();
  }

  public getFilterOnFields () {
    return (event) => {
      return this.filterOnFields(event);
    }
  }

  public exportData () {
    const projectData = this.group.projects.map(project => {
      const tempProject = _.pick(project, ['id', 'code', 'name', 'requestedFunds', 'status', 'governingEntities']);

      if (tempProject['status'] && tempProject['status'].length) {
          tempProject['status'] = tempProject['status'][0].label.en;
      }

      if (tempProject['governingEntities']) {
        tempProject['governingEntities'] = tempProject['governingEntities'].join(', ');
      }
      return tempProject;
    });

    const data = this.exportService.turnArrayOfObjectsIntoArrayOfArrays(
      projectData,
      [ 'id',
        'code',
        'name',
        'governingEntities',
        'status',
        'requestedFunds' ],
      [ 'ID',
        'Project Code',
        'Project Title',
        'Cluster',
        'Status',
        'Requested Funds' ]);
    const groupByParamName = this.unCamelCasePipe.transform(this.groupByParam);
    const filename = `${this.plan.name} - Breakdown for ${groupByParamName} ${this.group[this.nameKey]}.xlsx`;

    this.exportService.exportData([data], filename);
  }

  private updateContent () {
    const repackedFields = this.reportsService.turnFieldsIntoKeyValueOject(this.filterByFields);
    const filterByConditionField = this.reportsService.flattenConditionFields(repackedFields)

    this.apiService.getPlanProjectsByGroup(this.id, {
      groupBy: this.groupByParam,
      groupId: this.groupId,
      filterByStatus: this.filterSelectedArray,
      filterByConditionField
    })
      .subscribe(response => {
        this.group = response[0];
        if (this.group) {
          this.nameKey = _.find(Object.keys(this.group), key => {
            return key.indexOf('Name') !== -1 || key.indexOf('name') !== -1;
          });
        } else {
          console.log('error with this.group', this.group);
        }
      });
  }
}
