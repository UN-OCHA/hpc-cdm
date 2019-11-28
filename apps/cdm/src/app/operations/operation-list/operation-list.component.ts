import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { AuthService } from '@hpc/core';
import { AppService, OperationService } from '@cdm/core';

@Component({
  selector: 'operations',
  templateUrl: './operation-list.component.html',
  styleUrls: [ './operation-list.component.scss' ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class OperationListComponent implements OnInit {
  view?: string;
  loading: boolean = false;
  armed: boolean = false;
  columnsToDisplay = ['name'];
  expandedElement: any | null;
  tableColumns = [
    {columnDef: 'name', header: '', cell: (row) => `${row.name}`},
    // {columnDef: 'type', header: 'Type', cell: (row) => `${row.type}`}
  ];


  constructor(
    private auth: AuthService,
    private app: AppService,
    private operationService: OperationService) {}

  ngOnInit() {
    this.loading = true;
    // TODO revisit this. authentication service might not
    // be required here. it is only here because this is the first
    // route after the user logs in and to prevent requesting
    // operations after the user has been authenticated but before
    // the user/roles have been fetched.
    if(this.auth.user) {
      this.app.loadOperations();
    } else {
      this.auth.user$.subscribe(user => {
        if(user) {
          this.armed = true;
          this.app.loadOperations();
        }
      });
    }
    this.app.operations$.subscribe(operations => {
      // TODO understand why this is called even before we
      // set operations
      if(this.armed || operations.length) {
        this.loading = false;
        this.armed = false;
      }
    })
  }

  toggleExpansion(element) {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.operationService.operation = element;
  }
}
