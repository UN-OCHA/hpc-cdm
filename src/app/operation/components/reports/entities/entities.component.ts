import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';

@Component({
  selector: 'entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {

  constructor(private operation: OperationService) {}

  ngOnInit() {
    this.operation.entities$.subscribe(entities => {
      if(!this.operation.selectedEntity && entities.length) {
        this.operation.selectedEntity = entities[0];
        this.operation.loadEntityAttachments(entities[0].id);
      }
    });
  }
}
