import { Component, OnInit } from '@angular/core';
import { DataQueueService } from '../../services/data-queue.service';

@Component({
  selector: 'queue-table',
  templateUrl: './queue-table.component.html',
  styleUrls: ['./queue-table.component.scss']
})
export class QueueTableComponent implements OnInit {
  selectedAll: boolean = false;
  entries$;

  constructor(
    private queue: DataQueueService) {
    this.entries$ = this.queue.entries$;
  }

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
