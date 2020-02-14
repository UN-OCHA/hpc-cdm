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
  id;
  title: string;
  operation$ = this.appService.operation$;

  constructor(
    private modeService: ModeService,
<<<<<<< HEAD
    private appService: AppService){}
=======
    private operationService: OperationService){
    this.id = this.operationService.id;
  }
>>>>>>> cdm-dev

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    })
  }
}
