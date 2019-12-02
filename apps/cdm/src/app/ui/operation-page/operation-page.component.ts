import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'operation-page',
  templateUrl: './operation-page.component.html',
  styleUrls: ['./operation-page.component.scss'],
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
export class OperationPageComponent implements OnInit {
  @Input() title?;
  operation: Operation;
  titleExpanded = false;

  @ContentChild('operationPageTitleActionsTemplate', {static: false})
  pageTitleTemplateRef: TemplateRef<any>;

  @ContentChild('operationPageBodyTemplate', {static: false})
  pageBodyTemplateRef: TemplateRef<any>;


  constructor(private operationService: OperationService) {}

  ngOnInit() {
    this.operationService.operation$.subscribe(operation => {
      this.operation = operation;
    })
  }

  toggleTitle() {
    this.titleExpanded = !this.titleExpanded;
  }
}

// <ng-content select="[pageBody]"></ng-content>
