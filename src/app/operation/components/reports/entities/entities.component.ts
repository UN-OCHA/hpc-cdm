import { Component, OnInit } from '@angular/core';
import { OperationService } from '../../../services/operation.service';

@Component({
  selector: 'entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {

  constructor(
    private operation: OperationService) {}

  ngOnInit() {}

  dummy() {
    this.operation.getEntities(1);
  }
}
