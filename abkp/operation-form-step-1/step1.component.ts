import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from'@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ApiService } from '@hpc/core';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';
import * as moment from 'moment';

// import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';


@Component({
  selector: 'operation-form-step-1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class OperationFormStep1Component implements OnInit {
  currentYear = moment().year();
  operation: Operation;
  // public operationSubscription: Subscription;
  blueprints : Array<any>;

  form: FormGroup;
  // @Input() form: FormGroup;

  constructor(
    private operationService: OperationService,
    private fb: FormBuilder,
    private translate: TranslateService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    // this.doneLoading();
    // this.createOperationService.operationHasLoaded$
    //   .subscribe(() => {
    //     this.doneLoading();
    //   });
    //
    // this.childForm.statusChanges.subscribe(() => { this.checkValidity() });
  }

  get f() { return this.form.controls; }

  // doneLoading () {
    // this.setEditable();
    // this.checkValidity();

    // if (this.operation.isNewOperation) {
    //   this.api.getBlueprints().subscribe(blueprints => {
    //     this.blueprints = blueprints;
    //   });
    // }
  // }

  save (): Observable<any> {
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

  checkValidity () {
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

  clearErrors() {
    
  }
}


// <label for="name" translate="Name"></label> <i class="text-danger">*</i>
// <label for="description" translate="operation-edit.basic-info.operation-summary"></label> <i class="text-danger">*</i>


      // <div [hidden]="f.name.valid || f.name.pristine" class="alert alert-danger">Name is required</div>


// <section class="mt-2">
//   <div class="form-group" formGroupName="operationDetails">
//     <label translate>Emergencies<i class="text-danger">*</i></label>
//     <input [typeahead]="dataSourceEmergency"
//            (typeaheadOnSelect)="emergencyTypeaheadOnSelect($event)"
//            (typeaheadNoResults)="changeTypeaheadNoResults($event)"
//            typeaheadMinLength="3"
//            typeaheadOptionField="name"
//            (change)="checkValidity()"
//            [placeholder]="((operation.emergencies.length) ?  'operation-edit.basic-info.add-emergency2' : 'operation-edit.basic-info.add-emergency') | translate"
//            class="form-control inputStart"
//            [required]="operation.emergencies.length === 0"
//            autocomplete="off"
//            formControlName="emergency">
//     <div *ngIf="typeaheadNoResults" class="" style="">
//       <i class="fa fa-remove"></i>{{ 'No Results Found' | translate }}
//     </div>
//
//     <ul class="list-group" *ngFor="let emergency of operation.emergencies; let index = index;">
//       <li class="list-group-item">{{ emergency.name }}
//         <i class="material-icons remove-org clickable"
//           (click)="onDeleteEmergency(index)">clear
//         </i>
//       </li>
//     </ul>
//   </div>
//
// </section>
//
// <section class="mt-2">
//   <div class="form-group" formGroupName="operationDetails">
//     <label translate>Locations<i class="text-danger">*</i></label>
//     <input [typeahead]="dataSourceLocation"
//            (typeaheadOnSelect)="locationTypeaheadOnSelect($event)"
//            (typeaheadNoResults)="changeTypeaheadNoResults($event)"
//            typeaheadMinLength="3"
//            typeaheadOptionField="name"
//            (change)="checkValidity()"
//            [placeholder]="((operation.locations.length) ?  'operation-edit.basic-info.add-location2' : 'operation-edit.basic-info.add-location') | translate"
//            formControlName="location"
//            class="form-control inputStart"
//            [required]="operation.locations.length === 0"
//            autocomplete="off">
//     <div *ngIf="typeaheadNoResults" class="" style="">
//       <i class="fa fa-remove"></i>{{ 'No Results Found' | translate }}
//     </div>
//
//     <ul class="list-group" *ngFor="let location of operation.locations; let index = index;">
//       <li class="list-group-item">{{ location.name }}
//         <i class="material-icons remove-org clickable"
//           (click)="onDeleteLocation(index)">clear
//         </i>
//       </li>
//     </ul>
//   </div>
//
//   <div class="form-group" formGroupName="operationDetails">
//     <label for="template" translate="operation-edit.basic-info.Operation Template"></label> <i class="text-danger">*</i>
//     <select class="form-control" formControlName="blueprint" required>
//       <option value="" disabled>Choose your template</option>
//       <option *ngFor="let blueprint of blueprints" [ngValue]="blueprint.id">{{blueprint.name}}</option>
//     </select>
//   </div>
// </section>
