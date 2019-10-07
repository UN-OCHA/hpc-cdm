import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OperationService } from 'app/operation/services/operation.service';

@Component({
  selector: 'operation-gves-icons',
  templateUrl: './operation-gves-icons.component.html',
  styleUrls: ['./operation-gves-icons.component.scss']
})
export class OperationGvesIconsComponent implements OnInit {

  constructor(private operation: OperationService){}

  ngOnInit() {
    this.operation.entities$.subscribe(entities => {
      console.log(entities)
      console.log(entities.length);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.operation.entities, event.previousIndex, event.currentIndex);
  }
}
