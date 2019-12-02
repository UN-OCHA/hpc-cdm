import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
// import {  } from '@cdm/core';

@Component({
  selector: 'participant-list',
  templateUrl: './participant-list.component.html',
  styleUrls: [ './participant-list.component.scss' ]
})
export class ParticipantListComponent implements OnInit {
  participants = [];
  tableColumns = [];
  operationId: number;

  constructor(
    private activatedRoute: ActivatedRoute){
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationId = params.operationId;
    });
  }
}
