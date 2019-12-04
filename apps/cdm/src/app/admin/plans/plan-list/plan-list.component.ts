import { Component, OnInit } from '@angular/core';
import { AppService, OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';

@Component({
  selector: 'plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: [ './plan-list.component.scss' ]
})
export class PlanListComponent implements OnInit {
  op: Operation;

  constructor(private operation: OperationService) {}

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
  }
}
