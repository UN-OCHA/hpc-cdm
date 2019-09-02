
import { Subscription ,  Observable } from 'rxjs';

import {map, mergeMap, switchMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';


import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';

import { Operation } from 'app/operation/models/view.operation.model';

import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-basic-operation-info',
  templateUrl: './basic-operation-info.component.html',
  styleUrls: ['./basic-operation-info.component.scss']
})
export class BasicOperationInfoComponent extends CreateOperationChildComponent implements OnInit {

  public dataSourceEmergency: Observable<any>;
  public dataSourceLocation: Observable<any>;

  public currentYear = moment().year();

  public operation: Operation;
  public operationSubscription: Subscription;
  public typeaheadNoResults = false;
  public selectedEmergencyName = '';
  public selectedLocationName = '';
  public blueprints : Array<any>;

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService
  ) {
    super(createOperationService, apiService);

    if (this.createOperationService.isNewOperation) {
      this.createOperationService.operation.startDate = null;
      this.createOperationService.operation.endDate = null;
    }

    this.dataSourceEmergency = Observable
      .create((observer: any) => observer.next(this.selectedEmergencyName))
      .pipe(mergeMap((token: string) => this.apiService.autocompleteEmergency(token)));

    this.dataSourceLocation = Observable
      .create((observer: any) => observer.next(this.selectedLocationName))
      .pipe(mergeMap((token: string) => this.apiService.autocompleteLocation(token)));
  }

  ngOnInit() {
    this.doneLoading();
    this.createOperationService.operationHasLoaded$
      .subscribe(() => {
        this.doneLoading();
      });

    this.childForm.statusChanges
      .subscribe(() => { this.checkValidity() });
  }

  public setYear (year) {
    this.createOperationService.operation.planVersion.startDate = moment(year, 'YYYY').startOf('year').toDate();
    this.createOperationService.operation.planVersion.endDate = moment(year, 'YYYY').endOf('year').toDate();
  }

  private doneLoading () {
    this.setEditable();
    this.checkValidity();

    if (this.createOperationService.isNewOperation) {
      this.apiService.getBlueprints().subscribe(blueprints => {
        this.blueprints = blueprints;
      });
    }
  }

  public save (): Observable<any> {
    const operationVersionDataToSave = _.pick(this.createOperationService.operation, [
      'name',
      'description',
      'startDate',
      'endDate',
      'blueprint',
    ]);


    operationVersionDataToSave['planBlueprintId'] = operationVersionDataToSave['blueprint'] || 1;

    if (this.createOperationService.isNewOperation) {
      const createdOperation = {
        planVersion : this.createOperationService.operation.planVersion,
        categories:[5],
        gregorianYears:[2019],
        restricted:false,
        emergencies: this.createOperationService.operation.emergencies.map(emergency=> emergency.id),
        locations: this.createOperationService.operation.locations,
      };
      return this.apiService.createOperation(createdOperation).pipe(
        mergeMap(newOperation => {
          this.createOperationService.operation.id = newOperation.id;
          this.createOperationService.operation.updatedAt = newOperation.updatedAt;
          return this.saveOperationVersion(newOperation, true);
        }))
    } else {
      const operationToSave = {
        operationId: this.createOperationService.operation.id,
        updatedAt: this.createOperationService.operation.updatedAt,
        operationVersion: operationVersionDataToSave
      };
      return this.apiService.saveOperation(operationToSave).pipe(mergeMap(result => {
        this.createOperationService.operation.updatedAt = result.updatedAt;
        return this.saveOperationVersion(this.createOperationService.operation);
      }));
    }
  }

  // TODO: operationVersion check creation
  private saveOperationVersion (operation, isNew?): Observable<any> {
    return this.apiService.setOperationLocations(
        operation,
        this.createOperationService.operation.locations
      ).pipe(switchMap((locationResult) => {
        operation.updatedAt = locationResult.updatedAt;
        return this.apiService.setOperationEmergencies(
          operation,
          this.createOperationService.operation.emergencies
      )}), switchMap(() =>  {
      return this.apiService.getOperation(operation.id);
    }), map((refreshedOperation) => {
      this.createOperationService.operationDoneLoading(refreshedOperation);
      return {
        isNew: isNew,
        stopSave: true
      };
    }));
  }

  public changeTypeaheadNoResults(e: boolean) {
    this.typeaheadNoResults = e;
  }

  public emergencyTypeaheadOnSelect(e: TypeaheadMatch) {
    this.createOperationService.operation.emergencies.push(e.item);
    this.selectedEmergencyName = '';
  }

  public onDeleteEmergency(idx) {
    this.createOperationService.operation.emergencies.splice(idx, 1);
  }

  public locationTypeaheadOnSelect(e: TypeaheadMatch) {
    this.createOperationService.operation.locations.push(e.item);
    this.selectedLocationName = '';
  }

  public onDeleteLocation(idx) {
    this.createOperationService.operation.locations.splice(idx, 1);
  }

  public checkValidity () {
    if (this.childForm &&
        this.childForm.valid &&
        this.createOperationService.operation) {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }

}
