import { Component, Input, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'cdm-table',
  templateUrl: './cdm-table.component.html',
  styleUrls: ['./cdm-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('titleExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CdmTableComponent implements OnInit {
  @Input() dataSource;
  @Input() columns;
  @Input() title;
  operation: Operation;
  columnsToDisplay = [];
  titleExpanded = false;
  expandedTitle = true;

  constructor(private operationService: OperationService) {}

  ngOnInit() {
    this.columnsToDisplay = this.columns.map(c => c.columnDef);
    this.columnsToDisplay.push('actions');
    this.operationService.operation$.subscribe(operation => {
      this.operation = operation;
    })
  }

  toggleTitle() {
    this.titleExpanded = !this.titleExpanded;
  }
}
