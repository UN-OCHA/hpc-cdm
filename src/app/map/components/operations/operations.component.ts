import { Component, OnInit } from '@angular/core';

import { AppService } from 'app/shared/services/app.service';
import { ParticipantService } from 'app/shared/services/participant.service';

@Component({
  selector: 'operations',
  templateUrl: './operations.component.html',
  styleUrls: [ './operations.component.scss' ]
})
export class OperationsComponent implements OnInit {
  constructor(
    private app: AppService,
    private participant: ParticipantService) {}

  ngOnInit() {
    this.participant.load();
    this.app.loadOperations();
  }
}
