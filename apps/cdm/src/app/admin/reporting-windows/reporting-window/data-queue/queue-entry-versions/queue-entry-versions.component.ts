import { Component, OnInit } from '@angular/core';
import { QueueEntryService } from '../queue-entry/queue-entry.service';

@Component({
  selector: 'queue-entry-versions',
  templateUrl: './queue-entry-versions.component.html',
  styleUrls: ['./queue-entry-versions.component.scss']
})
export class QueueEntryVersionsComponent implements OnInit {

  constructor(private queueEntry: QueueEntryService) {}

  ngOnInit() {
    this.queueEntry.dummy();
  }
}
