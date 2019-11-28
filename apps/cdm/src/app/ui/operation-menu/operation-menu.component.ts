import { Component, OnInit } from '@angular/core';
import { AppService, OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';
import { AuthService } from '@hpc/core';

@Component({
  selector: 'operation-menu',
  templateUrl: './operation-menu.component.html',
  styleUrls: ['./operation-menu.component.scss']
})
export class OperationMenuComponent implements OnInit {
  op: Operation;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private operation: OperationService) {}

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      console.log('1111111111111111111111111111111111111111-100');
      console.log(this.op)
      this.op = op;
    });
    console.log(this.app);
  }
}
