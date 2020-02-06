import { Component, OnInit } from '@angular/core';
import { ModeService } from '@hpc/core';
import { OperationService } from '@cdm/core';

const TITLES = {
  'add': 'New Participant',
  'edit': 'Edit Participant',
  'list': 'Participants'
}

@Component({
  selector: 'participants',
  templateUrl: './participants.component.html'
})
export class ParticipantsComponent implements OnInit {
  id;
  title: string;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService){
    this.id = this.operationService.id;
  }

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    })
  }
}
