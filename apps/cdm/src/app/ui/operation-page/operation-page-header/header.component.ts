import { Component, Input, OnInit } from '@angular/core';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-page-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class OperationPageHeaderComponent implements OnInit {
  @Input() route;
  @Input() description;
  op: Operation;

  constructor(private operationService: OperationService) {}

  ngOnInit() {
    this.operationService.operation$.subscribe(op => {
      this.op = op;
    });
  }
}
