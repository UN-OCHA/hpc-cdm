import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OperationService } from 'app/shared/services/operation.service';

@Component({
  selector: 'operation-entities-header',
  templateUrl: './operation-entities-header.component.html',
  styleUrls: ['./operation-entities-header.component.scss']
})
export class OperationEntitiesHeaderComponent implements OnInit {

  constructor(private operation: OperationService){}

  ngOnInit() {
    // this.operation.entities$.subscribe(entities => {
    // });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.operation.entities, event.previousIndex, event.currentIndex);
  }
}
