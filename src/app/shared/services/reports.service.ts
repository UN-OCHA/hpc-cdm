
import {combineLatest as observableCombineLatest,  ReplaySubject ,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';


import { ApiService } from 'app/shared/services/api/api.service';

import * as _ from 'lodash';

@Injectable()
export class ReportsService {

  public originalGroupBy = [{
    key: 'none',
    name: 'None'
  }, {
    key: 'organization',
    name: 'Organization'
  }, {
    key: 'cluster',
    name: 'Cluster / Sector'
  }, {
    key: 'workflowStatus',
    name: 'Status'
  }, {
    key: 'globalCluster',
    name: 'Global sector'
  }, {
    key: 'plan',
    name: 'Plan'
  }, {
    key: 'year',
    name: 'Year'
  }, {
    key: 'location',
    name: 'Country'
  }];

  public groupBy = [];

  public fields;
  public filterByField;

  public filterByStatus;

  // public groupingSelectionUpdateSubject = new ReplaySubject<any>();
  // public groupingSelectionAsObservable = this.groupingSelectionUpdateSubject.asObservable();

  public shouldUpdateGroupingResultsSubject = new ReplaySubject<any>();
  public shouldUpdateGroupingResults = this.shouldUpdateGroupingResultsSubject.asObservable();

  constructor(
    private apiService: ApiService
  ) {
    this.groupBy = _.cloneDeep(this.originalGroupBy);
  }

  // Turns { key: ['val1', val2'] } into key:val1,val2
  public flattenConditionFields (fields): string {
    if (fields) {
      const str = [];
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          str.push(`${key}:${fields[key].join(',')}`)
        }
      }
      return str.join(';');
    }

    return '';
  }

  public turnFieldsIntoKeyValueOject (fields) {
    const filterSelectedFields = {};
    for (const field of fields) {
      if (field.selected) {
        filterSelectedFields[field.name] = field.filters
                                                      .filter(filter => filter.selected)
                                                      .map(filter => filter.key);
      }
    }

    return filterSelectedFields;
  }

  public turnSearchOptionsIntoParams (searchOptions, overwrite: any = {}) {
    let filterByStatus = searchOptions.workflowStatusOptionIds ? searchOptions.workflowStatusOptionIds.join(',') : '';
    if (overwrite.filterByStatus) {
      filterByStatus = overwrite.filterByStatus ? overwrite.filterByStatus.join(',') : filterByStatus;
    }

    const params = {
      date: searchOptions.date,
      planIds: overwrite.planId || searchOptions.planIds.join(','),
      groupBy: overwrite.groupBy || true,
      locationIds: searchOptions.locationIds ? searchOptions.locationIds.join(',') : '',
      workflowStatusOptionIds: filterByStatus || '',
      governingEntityIds: searchOptions.governingEntityIds ? searchOptions.governingEntityIds.join(',') : '',
      globalClusterIds: searchOptions.globalClusterIds ? searchOptions.globalClusterIds.join(',') : '',
      organizationIds: searchOptions.organizationIds ? searchOptions.organizationIds.join(',') : '',
      filterByConditionField: overwrite.filterByConditionField || ''
    }
    return params;
  }

  public getPlanAndProcedure (id, existingStatuses?): Observable<any> {

    return observableCombineLatest(
      this.apiService.getPlan(id, 'entityPrototypes').pipe(
        map(plan => {
          if (plan.entityPrototypes && plan.entityPrototypes.length) {
            const gEP = plan.entityPrototypes.filter(eP => eP.type === 'GVE');
            if (gEP && gEP.length) {
              const objIndex = this.originalGroupBy.findIndex((obj => obj.key === 'cluster'));
              this.originalGroupBy[objIndex].name = gEP[0].value.name.en.singular;
            }
          }
        })
      ),
      this.apiService.getProcedureByPlanId(id).pipe(
        map(procedure => {
          this.filterByStatus = procedure.workflowStatusOptions.map(option => {
            let selected = false;
            if (existingStatuses && existingStatuses.length) {
              selected = existingStatuses.indexOf(option.type) !== -1;
            } else {
              selected = option.type === 'rejected' ? false : true
            }
            return {
              key: option.type,
              name: option.value.label.en,
              selected: selected
            }
          });
          this.groupBy = _.cloneDeep(this.originalGroupBy);

          this.fields = procedure.conditionFields
            .filter(field => {
              const notMultipleSelect = (field.fieldType === 'select' && !field.rules.multiple);

              if (field.fieldType === 'checkbox' || notMultipleSelect) {
                this.groupBy.push({
                  name: 'field: ' + field.name,
                  key: 'conditionField:' + field.name
                })
              }

              if (field.fieldType === 'checkbox') {
                field.filters = [{
                  // the key is actually what we send as the acceptable value
                  // so in the case of a checkbox that's "true" or not.
                  key: 'true',
                  name: field.name,
                  selected: true
                }];
                return true;
              } else if (notMultipleSelect) {
                field.filters = field.rules.options.map((option) => {
                  return {
                    key: option,
                    name: option,
                    selected: true
                  }
                });
                return true;
              }

              // we don't care about any of the other conditionFields
              return false;
            });

          return {procedure, groupBy: this.groupBy};
        })),
      (plan, results) => ({ plan, procedure: results.procedure, groupBy: results.groupBy }));

  }
}
