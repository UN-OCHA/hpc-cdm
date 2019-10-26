
import { Subscription ,  Observable } from 'rxjs';

import {map, mergeMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { OperationService } from 'app/shared/services/operation/operation.service';

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
    public apiService: ApiService,
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute
  ) {
    super(createOperationService, apiService);

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

    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationService.loadOperation(params.id);
      }
    });
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
    if (this.createOperationService.isNewOperation) {
      const createdOperation = {
        operationVersion : this.createOperationService.operation.operationVersion,
        emergencies: this.createOperationService.operation.emergencies.map(emergency=> emergency.id),
        locations: this.createOperationService.operation.locations.map(location=> location.id),
        blueprintId: this.createOperationService.operation.operationVersion.planBlueprintId,
      };
      return this.apiService.createOperation(createdOperation).pipe(
        map(newOperation => {
          this.createOperationService.operation.id = newOperation.id;
          this.createOperationService.operation.operationVersion = newOperation.operationVersion;
          this.createOperationService.operation.opEntityPrototypes = newOperation.opEntityPrototypes;
          this.createOperationService.operation.opAttachmentPrototypes = newOperation.opAttachmentPrototypes;
          this.createOperationService.operation.updatedAt = newOperation.updatedAt;
          this.createOperationService.operationDoneLoading(newOperation);
          return {
            isNew: true,
            stopSave: true
          };
        }));
    } else {
      const operationToSave = {
        operationVersion : this.createOperationService.operation.operationVersion,
        emergencies: this.createOperationService.operation.emergencies.map(emergency=> emergency.id),
        locations: this.createOperationService.operation.locations.map(location=> location.id),
        id: this.createOperationService.operation.id,
        updatedAt: this.createOperationService.operation.updatedAt,
      };
      return this.apiService.saveOperation(operationToSave).pipe(map(result => {
        this.createOperationService.operation.updatedAt = result.updatedAt;
          this.createOperationService.operation.operationVersion = result.operationVersion;
        this.createOperationService.operationDoneLoading(this.createOperationService.operation);
        return {
          isNew: false,
          stopSave: true
        };
      }));
    }
  }

  public changeTypeaheadNoResults(e: boolean) {
    this.typeaheadNoResults = e;
  }

  public emergencyTypeaheadOnSelect(e: TypeaheadMatch) {
    this.createOperationService.operation.emergencies.push(e.item);
    this.selectedEmergencyName = '';
  }

  public onDeleteEmergency(idx:any) {
    this.createOperationService.operation.emergencies.splice(idx, 1);
  }

  public locationTypeaheadOnSelect(e: TypeaheadMatch) {
    this.createOperationService.operation.locations.push(e.item);
    this.selectedLocationName = '';
  }

  public onDeleteLocation(idx:any) {
    this.createOperationService.operation.locations.splice(idx, 1);
  }

  public checkValidity () {
    if (this.childForm &&
        this.childForm.valid &&
        this.createOperationService.operation &&
        this.createOperationService.operation.emergencies.length &&
        this.createOperationService.operation.emergencies.length) {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }

}
