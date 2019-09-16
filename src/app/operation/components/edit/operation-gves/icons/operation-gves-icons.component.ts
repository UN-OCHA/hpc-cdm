import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
// import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'operation-gves-icons',
  templateUrl: './operation-gves-icons.component.html',
  styleUrls: ['./operation-gves-icons.component.scss']
})
export class OperationGvesIconsComponent implements OnInit {

  @Input() list: Array<any>;
  // constructor(private api: ApiService) {}

  ngOnInit() {
    // TODO
    // this.api.getOperationGves()
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
  }
}
