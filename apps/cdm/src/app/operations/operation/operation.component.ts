import { Component, OnInit } from '@angular/core';
import { AuthService } from '@hpc/core';
import { Operation } from '@hpc/data';
import { OperationService } from '@cdm/core';

const TITLES = {
  'add': 'New Operation',
  'edit': 'Edit Operation',
  'list': 'Operations'
}

@Component({
  selector: 'operation',
  templateUrl: './operation.component.html',
  styleUrls: [ './operation.component.scss' ],
})
export class OperationComponent implements OnInit {
  title: string;
  op: Operation;

  constructor(
    private authService: AuthService,
    private operationService: OperationService){}

  ngOnInit() {
    this.operationService.operation$.subscribe(operation => {
      this.op = operation;
    });
  }
}
