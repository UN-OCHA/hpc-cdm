import { Component, Input, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { Operation } from 'app/shared/services/operation/operation.models';

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
