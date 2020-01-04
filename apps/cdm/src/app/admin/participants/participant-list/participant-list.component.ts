import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
import { AppService, ModeService } from '@hpc/core';


@Component({
  selector: 'participant-list',
  templateUrl: './participant-list.component.html',
  styleUrls: [ './participant-list.component.scss' ]
})
export class ParticipantListComponent implements OnInit {
  tableColumns = [];
  operation$ = this.appService.operation$;
  participants$ = this.appService.participants$;

  constructor(
    private modeService: ModeService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute){
  }

  ngOnInit() {
    this.modeService.mode = 'list';
    this.activatedRoute.params.subscribe(params => {
      this.appService.loadParticipants(params.id);
    });
  }
}
