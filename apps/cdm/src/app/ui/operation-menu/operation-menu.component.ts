import { Component, OnInit } from '@angular/core';
import { AppService, OperationService } from '@cdm/core';
import { Operation, User } from '@hpc/data';
import { AuthService } from '@hpc/core';

@Component({
  selector: 'operation-menu',
  templateUrl: './operation-menu.component.html',
  styleUrls: ['./operation-menu.component.scss']
})
export class OperationMenuComponent implements OnInit {
  op: Operation;
  user: User;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private operation: OperationService) {}

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
    this.auth.user$.subscribe(user => {
      this.user = user;
    })
  }
}
