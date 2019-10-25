import { Component, Input, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';

@Component({
  selector: 'operation-item',
  templateUrl: './operation-item.component.html',
  styleUrls: [ './operation-item.component.scss' ]
})
export class OperationItemComponent implements OnInit {
  @Input() operation: any;
  showMenu: boolean = false;

  constructor(private operationService: OperationService) {}

  ngOnInit() {
  }

  select() {
    if(this.operationService.operation &&
      this.operation.id === this.operationService.operation.id) {
      this.operationService.operation = null;
    } else {
      this.showMenu = true;
      this.operationService.loadOperation(this.operation.id);
    }
  }
}
