import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';

@Component({
  selector: 'operation-stepper',
  templateUrl: './operation-stepper.component.html',
  styleUrls: [ './operation-stepper.component.scss' ]
})
export class OperationStepperComponent implements OnInit {
  isLinear = true;
  steps = [];

  constructor(
    private operationService: OperationService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationService.loadOperation(params.id).subscribe((operation: Operation) => {
        console.log(operation)
        if(operation) {
          this.steps = [];
          this.steps.push({name: 'Operation Details', type: 'OP'});
          if(operation.attachmentPrototype) {
            console.log(operation.attachmentPrototype)
            this.steps.push({
              name: 'Operation Attachments',
              type: `OP-${operation.attachmentPrototype.refCode}`});
          }
          if(operation.entityPrototypes.length) {
            operation.entityPrototypes.forEach(p => {
              const stepName = p.name.en;
              this.steps.push({name: stepName.plural, type: p.refCode});
              if(p.attachmentPrototype) {
                this.steps.push({
                  name: `${stepName.singular} Attachments`,
                  type: `${p.refCode}-${p.attachmentPrototype.refCode}`});
              }
            });
          }
          this.steps.push({name: 'Review', type: 'RE'});
        }
      });
    });
  }
}




// <operation-form *ngSwitchCase="'OP'"></operation-form>
// <operation-attachments *ngSwitchCase="'OP-CF'">Operation Attachments</operation-attachments>
// <operation-entities *ngSwitchCase="'CL'"></operation-entities>
// <div *ngSwitchCase="'CL-CF'">Field Cluster Attachments</div>
// <div *ngSwitchCase="'RE'">Review</div>















// formGroup: FormGroup;
// firstFormGroup: FormGroup;
// secondFormGroup: FormGroup;

// forms: FormGroup[] = [];

// this.formGroup = new FormGroup({
//   'operation': new FormGroup({
//     'name': new FormControl('name', Validators.required),
//     'description': new FormControl(null, Validators.required),
//     'emergency': new FormControl(null, Validators.required),
//     'location': new FormControl(null, Validators.required),
//     'blueprint': new FormControl(null, Validators.required),
//   }),
//   'cluster': new FormGroup({
//     'name': new FormControl('name', Validators.required),
//     'description': new FormControl(null, Validators.required),
//     'emergency': new FormControl(null, Validators.required),
//     'location': new FormControl(null, Validators.required),
//     'blueprint': new FormControl(null, Validators.required),
//   })
// });


// this.forms = [
//   {name: 'operation', description: 'Operation Details'},
//   {name: 'operation', description: 'Operation Attachments'},
//   {name: 'cluster', description: 'Cluster Details'},
//   {name: 'cluster', description: 'Cluster Attachments'},
// ];

// this.firstFormGroup = this.fb.group({
//   firstCtrl: ['', Validators.required]
// });
// this.secondFormGroup = this.fb.group({
//   secondCtrl: ['', Validators.required]
// });
//
// this.activatedRoute.params.subscribe(params => {
//   this.operationService.loadOperation(params.id).subscribe(op => {
//
    // op.attachmentPrototypes.forEach(ap => {
    //   this.forms.push(this.fb.group({
    //     firstCtrl: ['', Validators.required]
    //   });
    // });
    //
    // op.entityPrototypes.forEach(ap => {
    //   this.forms.push(this.fb.group({
    //     firstCtrl: ['', Validators.required]
    //   });
    // });
    //
    //
//   });
// });




// <form [formGroup]="form">
// </form>


// <mat-step formGroupName="operationDetails"
//   [stepControl]="form.get('operationDetails')">
//   <ng-template matStepLabel>Operation</ng-template>
//     <operation-form></operation-form>
//   <div class="buttons">
//     <button mat-raised-button matStepperNext>Next</button>
//   </div>
// </mat-step>
// <mat-step formGroupName="clusterDetails" [stepControl]="form.get('clusterDetails')">
//   <ng-template matStepLabel>Cluster</ng-template>
//   <div class="buttons">
//     <button mat-raised-button matStepperPrevious>Back</button>
//     <button mat-raised-button matStepperNext>Next</button>
//   </div>
// </mat-step>
// <mat-step formGroupName="clusterDetails" [stepControl]="form.get('clusterDetails')">
//   <ng-template matStepLabel>Cluster</ng-template>
//   <div class="buttons">
//     <button mat-raised-button matStepperPrevious>Back</button>
//     <button mat-raised-button matStepperNext>Next</button>
//   </div>
// </mat-step>
// <mat-step formGroupName="clusterDetails" [stepControl]="form.get('clusterDetails')">
//   <ng-template matStepLabel>Cluster</ng-template>
//   <div class="buttons">
//     <button mat-raised-button matStepperPrevious>Back</button>
//     <button mat-raised-button matStepperNext>Next</button>
//   </div>
// </mat-step>



// // operation.attachmentPrototype
// operation.attachmentPrototypes.forEach(p => {
//   if (p.value.entities.indexOf('OP'))
//     route: ['/operations', operation.id, 'attachments'],
//
// // operation.entities
// operation.entityPrototypes.forEach(eP => {
//   route: ['/operations', operation.id, 'entities', eP.id],
//   step: 'gves/:entityPrototypeId',
//   name: eP.opEntityPrototypeVersion.value.name.en.plural
//
//   // operation.entity.attachmentPrototype
//   operation.attachmentPrototypes.forEach(aP => {
//     if (aP.value.entities.filter((entity:any) => entity === eP.refCode).length) {
//       route: ['/operation', operation.id, 'eattachments', eP.id],
//       step: 'gves-attachments/:entityPrototypeId',
//       name: eP.value.name.en.plural + ' attachments'
//
// route: ['/operations', operation.id,'review'],





// <mat-step [stepControl]="firstFormGroup">
//   <form [formGroup]="firstFormGroup">
//     <ng-template matStepLabel>Operation Details</ng-template>
//     <mat-form-field>
//       <input matInput placeholder="Last name, First name" formControlName="firstCtrl" required>
//     </mat-form-field>
//     <div>
//       <button mat-button matStepperNext>Next</button>
//     </div>
//   </form>
// </mat-step>
// <mat-step [stepControl]="secondFormGroup">
//   <form [formGroup]="secondFormGroup">
//     <ng-template matStepLabel>Fill out your address</ng-template>
//     <mat-form-field>
//       <input matInput placeholder="Address" formControlName="secondCtrl" required>
//     </mat-form-field>
//     <div>
//       <button mat-button matStepperPrevious>Back</button>
//       <button mat-button matStepperNext>Next</button>
//     </div>
//   </form>
// </mat-step>
// <mat-step>
//   <ng-template matStepLabel>Done</ng-template>
//   You are now done.
//   <div>
//     <button mat-button matStepperPrevious>Back</button>
//     <button mat-button (click)="stepper.reset()">Reset</button>
//   </div>
// </mat-step>
