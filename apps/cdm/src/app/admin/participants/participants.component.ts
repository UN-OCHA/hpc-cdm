import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';

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
  title: string;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
    private appService: AppService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    })
  }
}
