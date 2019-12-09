import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { Operation } from '@hpc/data';
// import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-title',
  templateUrl: './operation-title.component.html',
  styleUrls: ['./operation-title.component.scss']
})
export class OperationTitleComponent implements OnInit {
  @Input() operation;
  @Input() element?;
  @Input() expandedElement?;

  @ContentChild('operationTitleActionsTemplate', {static: false})
  titleActionsTemplateRef: TemplateRef<any>;

  // op: Operation;
  // expanded: boolean = false;

  // constructor(private operation: OperationService) {}

  ngOnInit() {
    // this.operation.operation$.subscribe(op => {
    //   this.op = op;
    // });
  }
}