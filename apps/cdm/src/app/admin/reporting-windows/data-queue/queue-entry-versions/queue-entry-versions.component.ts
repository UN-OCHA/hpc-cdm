import { Component, OnInit } from '@angular/core';
import { QueueEntryService } from '../../services/queue-entry.service';

@Component({
  selector: 'queue-entry-versions',
  templateUrl: './queue-entry-versions.component.html',
  styleUrls: ['./queue-entry-versions.component.scss']
})
export class QueueEntryVersionsComponent implements OnInit {
  versions$;

  constructor(private queueEntry: QueueEntryService) {
    this.versions$ = this.queueEntry.versions$;
  }

  ngOnInit() {
    this.queueEntry.dummy();
  }
}
