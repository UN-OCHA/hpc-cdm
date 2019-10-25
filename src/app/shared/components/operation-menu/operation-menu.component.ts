import { Component, OnInit } from '@angular/core';
import { ParticipantService } from 'app/shared/services/participant.service';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { Operation } from 'app/shared/services/operation/operation.models';

@Component({
  selector: 'operation-menu',
  templateUrl: './operation-menu.component.html',
  styleUrls: ['./operation-menu.component.scss']
})
export class OperationMenuComponent implements OnInit {
  op: Operation;

  constructor(
    private operation: OperationService,
    private participant: ParticipantService) {}

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
    this.participant.load();
  }
}
