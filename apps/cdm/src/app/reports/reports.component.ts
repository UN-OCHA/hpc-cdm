import { Component, OnInit } from '@angular/core';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  steps: any[];
  selectedStepIndex: number = 0;

  constructor(
    private operationService: OperationService){}

  ngOnInit() {
    this.operationService.loadOperation(this.operationService.id).subscribe(op=> {
      this.steps = [];
      this.steps.push({name: 'Operation Reports', type: 'OP',
        route: ['/operations', op.id, 'reports']});
      if(op.entityPrototypes.length) {
        op.entityPrototypes.forEach(p => {
          const stepName = p.name.en;
          this.steps.push({name: stepName.plural, type: p.refCode,
            route: ['/operations', op.id, 'reports', p.id]});
        });
      }
      console.log(this.steps)
    });
  }

  onSelectionChange(event: any) {
    console.log('Got selection index')
    console.log(event)
    this.selectedStepIndex= event;
  }
}
