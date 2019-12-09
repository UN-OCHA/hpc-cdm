import { Component, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'operation-stepper',
  templateUrl: './operation-stepper.component.html',
  styleUrls: ['./operation-stepper.component.scss']
})
export class OperationStepperComponent implements OnInit {
  title: string;
  steps = [];
  selectedStepIndex: number = 0;
  loadingStep: boolean = false;


  constructor(
    // private router: Router,
    private activatedRoute: ActivatedRoute,
    private operationService: OperationService){}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationService.loadOperation(params.id).subscribe(op=> {
        this.steps = [];
        this.steps.push({name: 'Operation Details', type: 'OP',
          route: ['/operations', op.id, 'details']});
        console.log(op)
        if(op.attachmentPrototype) {
          this.steps.push({
            name: 'Operation Attachments',
            type: `OP-${op.attachmentPrototype.refCode}`,
            route: ['/operations', op.id, 'attachments']});
        }
        if(op.entityPrototypes.length) {
          op.entityPrototypes.forEach(p => {
            const stepName = p.name.en;
            this.steps.push({name: stepName.plural, type: p.refCode,
              route: ['/operations', op.id, 'entities', p.id]});
            if(p.attachmentPrototype) {
              this.steps.push({
                name: `${stepName.singular} Attachments`,
                type: `${p.refCode}-${p.attachmentPrototype.refCode}`,
                route: ['/operations', op.id, 'entities', p.id, 'attachments']});
            }
          });
        }
        this.steps.push({name: 'Review', type: 'RE',
          route: ['/operations', op.id, 'review']});
      })
    });
  }

  onSelectionChange(event: any) {
    console.log(event);
    // this.jsonModel = event;
    this.selectedStepIndex= event;
  }

  // selectionChanged(event: any) {
  //   this.loadingStep = true;
  //   this.selectedStepIndex= event.selectedIndex;
  //   setTimeout(() => {
  //     console.log('navigating...................')
  //     this.router.navigate(this.steps[this.selectedStepIndex]);
  //     this.loadingStep = false;
  //   });
  // }
}
















// <custom-stepper [allSteps]="steps" (change)="onSelectionChange($event)">
//   <cdk-step *ngFor="let step of steps; let i = index;">
//     <router-outlet *ngIf="i === selectedStepIndex"></router-outlet>
//   </cdk-step>
// </custom-stepper>