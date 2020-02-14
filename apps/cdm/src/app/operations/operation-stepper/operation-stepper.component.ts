import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';
import { Operation } from '@hpc/data';


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
  operation$ = this.appService.operation$;


  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService,
    private appService: AppService){}

  ngOnInit() {
    this.modeService.mode = 'edit';
    this.activatedRoute.params.subscribe(params => {
<<<<<<< HEAD
      this.appService.loadOperation(params.id);
      this.operation$.subscribe(op => {
        this.steps = this._buildSteps(op);
      });
=======
      this.operationService.loadOperation(params.id).subscribe(op=> {
        this.steps = [];
        this.steps.push({name: 'Operation Details', type: 'OP',
          route: ['/operations', op.id]});
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
>>>>>>> cdm-dev
    });
  }

  onSelectionChange(event: any) {
    if(Number.isInteger(event)){
      this.selectedStepIndex= event;
    }
  }

  private _buildSteps(op: Operation) {
    const _steps = [];
    _steps.push({name: 'Operation Details', type: 'OP', route: ['/operations', op.id, 'details']});
    if(op.attachmentPrototype) {
      _steps.push({name: 'Operation Attachments', type: `OP-${op.attachmentPrototype.refCode}`, route: ['/operations', op.id, 'attachments']});
    }
    if(op.entityPrototypes.length) {
      op.entityPrototypes.forEach(p => {
        const stepName = p.name.en;
        _steps.push({name: stepName.plural, type: p.refCode, route: ['/operations', op.id, 'entities', p.id]});
        if(p.attachmentPrototype) {
          _steps.push({
            name: `${stepName.singular} Attachments`,
            type: `${p.refCode}-${p.attachmentPrototype.refCode}`,
            route: ['/operations', op.id, 'entities', p.id, 'attachments']});
        }
      });
    }
    _steps.push({name: 'Review', type: 'RE', route: ['/operations', op.id, 'review']});
    return _steps;
  }
}
