import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
import { ModeService } from '@hpc/core';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'participant-list',
  templateUrl: './participant-list.component.html',
  styleUrls: [ './participant-list.component.scss' ]
})
export class ParticipantListComponent implements OnInit {
  participants = [];
  tableColumns = [];
  id: number;

  constructor(
    private modeService: ModeService,
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute){
  }

  ngOnInit() {
    this.modeService.mode = 'list';
    this.activatedRoute.params.subscribe(params => {
      this.id = params.operationId;
    });
  }
}
