import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ApiService } from '@hpc/core';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';


@Component({
  selector: 'operation-form-step-1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class OperationFormStep1Component implements OnInit {
  public dataSourceEmergency: Observable<any>;
  public dataSourceLocation: Observable<any>;

  public currentYear = moment().year();

  public operation: Operation;
  // public operationSubscription: Subscription;
  public typeaheadNoResults = false;
  public selectedEmergencyName = '';
  public selectedLocationName = '';
  public blueprints : Array<any>;


  @Input() regForm: FormGroup;


  constructor(
    public operationService: OperationService,
    public api: ApiService
  ) {
    this.dataSourceEmergency = Observable
      .create((observer: any) => observer.next(this.selectedEmergencyName))
      .pipe(mergeMap((token: string) => this.api.autocompleteEmergency(token)));

    this.dataSourceLocation = Observable
      .create((observer: any) => observer.next(this.selectedLocationName))
      .pipe(mergeMap((token: string) => this.api.autocompleteLocation(token)));
  }

  ngOnInit() {
    this.doneLoading();
    // this.createOperationService.operationHasLoaded$
    //   .subscribe(() => {
    //     this.doneLoading();
    //   });
    //
    // this.childForm.statusChanges.subscribe(() => { this.checkValidity() });
  }

  private doneLoading () {
    // this.setEditable();
    // this.checkValidity();

    // if (this.operation.isNewOperation) {
    //   this.api.getBlueprints().subscribe(blueprints => {
    //     this.blueprints = blueprints;
    //   });
    // }
  }

  public save (): Observable<any> {
    // if (this.createOperationService.isNewOperation) {
    //   const createdOperation = {
    //     operationVersion : this.createOperationService.operation.operationVersion,
    //     emergencies: this.createOperationService.operation.emergencies.map(emergency=> emergency.id),
    //     locations: this.createOperationService.operation.locations.map(location=> location.id),
    //     blueprintId: this.createOperationService.operation.operationVersion.planBlueprintId,
    //   };
    //   return this.api.createOperation(createdOperation).pipe(
    //     map(newOperation => {
    //       this.createOperationService.operation.id = newOperation.id;
    //       this.createOperationService.operation.operationVersion = newOperation.operationVersion;
    //       this.createOperationService.operation.opEntityPrototypes = newOperation.opEntityPrototypes;
    //       this.createOperationService.operation.opAttachmentPrototypes = newOperation.opAttachmentPrototypes;
    //       this.createOperationService.operation.updatedAt = newOperation.updatedAt;
    //       this.createOperationService.operationDoneLoading(newOperation);
    //       return {
    //         isNew: true,
    //         stopSave: true
    //       };
    //     }));
    // } else {
    //   const operationToSave = {
    //     operationVersion : this.createOperationService.operation.operationVersion,
    //     emergencies: this.createOperationService.operation.emergencies.map(emergency=> emergency.id),
    //     locations: this.createOperationService.operation.locations.map(location=> location.id),
    //     id: this.createOperationService.operation.id,
    //     updatedAt: this.createOperationService.operation.updatedAt,
    //   };
    //   return this.api.saveOperation(operationToSave).pipe(map(result => {
    //     this.createOperationService.operation.updatedAt = result.updatedAt;
    //       this.createOperationService.operation.operationVersion = result.operationVersion;
    //     this.createOperationService.operationDoneLoading(this.createOperationService.operation);
    //     return {
    //       isNew: false,
    //       stopSave: true
    //     };
    //   }));
    // }
    return null;
  }

  public changeTypeaheadNoResults(e: boolean) {
    this.typeaheadNoResults = e;
  }

  public emergencyTypeaheadOnSelect(e: TypeaheadMatch) {
    // this.createOperationService.operation.emergencies.push(e.item);
    this.selectedEmergencyName = '';
  }

  public onDeleteEmergency(idx:any) {
    // this.createOperationService.operation.emergencies.splice(idx, 1);
  }

  public locationTypeaheadOnSelect(e: TypeaheadMatch) {
    // this.createOperationService.operation.locations.push(e.item);
    this.selectedLocationName = '';
  }

  public onDeleteLocation(idx:any) {
    // this.createOperationService.operation.locations.splice(idx, 1);
  }

  public checkValidity () {
    // if (this.childForm &&
    //     this.childForm.valid &&
    //     this.createOperationService.operation &&
    //     this.createOperationService.operation.emergencies.length &&
    //     this.createOperationService.operation.emergencies.length) {
      // this.isValid = true;
    // } else {
      // this.isValid = false;
    // }
  }
}
