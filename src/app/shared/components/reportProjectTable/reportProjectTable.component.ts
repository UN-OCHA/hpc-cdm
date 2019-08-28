import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

// TODO: do we have to import this pipe cause it's already imported
// in SharedModule.
import { UnCamelCasePipe } from 'app/shared/pipes/un-camel-case.pipe';

import { ApiService } from 'app/shared/services/api/api.service';
import { ExportService } from 'app/shared/services/export.service';
import { ReportsService } from 'app/shared/services/reports.service';


import * as _ from 'lodash';

@Component({
  selector: 'app-report-project-table',
  templateUrl: './reportProjectTable.component.html',
  styleUrls: ['./reportProjectTable.component.scss'],
  providers: [UnCamelCasePipe]
})
export class ReportProjectTableComponent implements OnInit {

  public results: Array<any>;
  public nameKey: string;
  public idKey: string;

  @Input() searchOptions;
  @Input() planId: number;
  @Input() planName: number;
  @Input() groupBy: string;
  @Input() filterByStatus: Array<any>;
  @Input() filterByFields: any;
  @Input() dataUpdated: Observable<any>;

  constructor (
    private apiService: ApiService,
    private unCamelCasePipe: UnCamelCasePipe,
    private exportService: ExportService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {

    this.loadData();

    this.dataUpdated
      .subscribe(searchOptions => {
        if (searchOptions && searchOptions.filterByFields) {
          this.filterByFields = searchOptions.filterByFields;
        }
        if (searchOptions && searchOptions.groupBy) {
          this.groupBy = searchOptions.groupBy;
        }
        if (searchOptions && searchOptions.filterByStatus) {
          this.filterByStatus = searchOptions.filterByStatus;
        }
        this.loadData();
      })
  }

  private loadData () {
    const strippedGroupBy = this.groupBy.replace('conditionField:', '')

    this.nameKey = _.camelCase(strippedGroupBy) + 'Name';
    this.idKey = _.camelCase(strippedGroupBy) + 'Id';

    const filterByConditionField = this.reportsService.flattenConditionFields(this.filterByFields)

    this.apiService.getGroupedProjects(
      this.reportsService.turnSearchOptionsIntoParams(this.searchOptions, {
        planId: this.planId,
        filterByConditionField,
        groupBy: this.groupBy,
        filterByStatus: this.filterByStatus
      })
    ).subscribe(results => this.loadProjects(results));
  }

  public exportData () {
    const data = this.exportService.turnArrayOfObjectsIntoArrayOfArrays(
      this.results,
      [ this.nameKey,
        'projectCount',
        'sumOrigReqFunds',
        'sumCurrReqFunds',
        'sumLatestReqFunds'],
      [ this.unCamelCasePipe.transform(this.nameKey),
        '# of Projects',
        'Original Requirements',
        'Revised Requirements',
        'Running Requirements']);

    this.exportService.exportData([data], `${this.planName} - Breakdown by ${this.unCamelCasePipe.transform(this.groupBy)}.xlsx`);
  }

  private loadProjects (results) {
    this.results = results;
    if (this.results && this.results.length) {
      this.nameKey = _.find(Object.keys(this.results[0]), key => {
        return key.indexOf('Name') !== -1 || key.indexOf('name') !== -1;
      });
      this.idKey = _.find(Object.keys(this.results[0]), key => {
        return key.indexOf('Id') !== -1 || key.indexOf('ID') !== -1;
      });
    }
  }
}
