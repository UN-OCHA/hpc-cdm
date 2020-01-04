import { Component, OnInit } from '@angular/core';
import { DataQueueService } from '../data-queue.service';

@Component({
  selector: 'queue-table',
  templateUrl: './queue-table.component.html',
  styleUrls: ['./queue-table.component.scss']
})
export class QueueTableComponent implements OnInit {
  selectedAll: boolean = false;

  constructor(
    private queue: DataQueueService) {}

  ngOnInit() {
    this.queue.selectionState$.subscribe(value => {
      if(value === 'undefined') {
        this.selectedAll = false;
      }
    });
  }

  toggleSelection() {
    this.selectedAll = !this.selectedAll;
    this.queue.selectionState = this.selectedAll ? 'all' : 'none';
  }
}
