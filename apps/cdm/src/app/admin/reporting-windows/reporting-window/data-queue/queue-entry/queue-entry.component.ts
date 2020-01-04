import { Component, OnInit, Input } from '@angular/core';
import { DataQueueService } from '../data-queue.service';
import { QueueEntryService } from './queue-entry.service';

@Component({
  selector: 'queue-entry',
  templateUrl: './queue-entry.component.html',
  styleUrls: ['./queue-entry.component.scss'],
  providers: [
    QueueEntryService
  ]
})
export class QueueEntryComponent implements OnInit {
  @Input() entry;
  state: string = 'closed';
  selected: boolean = false;

  constructor(
    private queue: DataQueueService,
    private queueEntry: QueueEntryService) {}

  ngOnInit() {
    this.queueEntry.entry = this.entry;
    this.queue.selectionState$.subscribe(value => {
      if(value === 'all') {
        this.selected = true;
      } else if(value === 'none') {
        this.selected = false;
      }
    });
  }

  toggleExpand() {
    this.state = this.state === 'closed' ? 'open' : 'closed';
    if(this.state === 'open') {
      this.queueEntry.loadDataVersions();
    }
  }

  toggleSelection() {
    this.selected = !this.selected;
    this.queue.selectionState = 'undefined';
  }
}
