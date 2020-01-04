import { Component, OnInit } from '@angular/core';
import { OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';
import { ModeService } from '@hpc/core';

@Component({
  selector: 'plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: [ './plan-list.component.scss' ]
})
export class PlanListComponent implements OnInit {
  op: Operation;

  constructor(
    private modeService: ModeService,
    private operation: OperationService) {}

  ngOnInit() {
    this.modeService.mode = 'list';
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
  }
}
