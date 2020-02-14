import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
import { AppService, ModeService, PaginatedDataSource } from '@hpc/core';
import { UserService, UserQuery } from './user.service';
import { User } from './user';

@Component({
  selector: 'participant-list',
  templateUrl: './participant-list.component.html',
  styleUrls: [ './participant-list.component.scss' ]
})
export class ParticipantListComponent implements OnInit {
<<<<<<< HEAD
  // tableColumns = [];
  // operation$ = this.appService.operation$;
  // participants$ = this.appService.participants$;
  //
=======
  participants = [];
  tableColumns = [];
  id: number;

>>>>>>> cdm-dev
  constructor(
    private modeService: ModeService,
    private users: UserService
  //   private appService: AppService,
  //   private activatedRoute: ActivatedRoute){
  ){}

  tableColumns = [
    {columnDef: 'id', header: 'No.', cell: (row) => `${row.id}`},
    {columnDef: 'name', header: 'Username', cell: (row) => `${row.username}`},
    {columnDef: 'email', header: 'Email', cell: (row) => `${row.email}`},
    {columnDef: 'registration', header: 'Registration', cell: (row) => `${row.registrationDate}`}
    // | date
  ];

  data = new PaginatedDataSource<User, UserQuery> (
    (request, query) => this.users.page(request, query),
    {property: 'username', order: 'desc'},
    {search: '', registration: undefined},
    5
  );

  ngOnInit() {
    this.modeService.mode = 'list';
<<<<<<< HEAD
    // this.activatedRoute.params.subscribe(params => {
    //   this.appService.loadParticipants(params.id);
    // });
=======
    this.activatedRoute.params.subscribe(params => {
      this.id = params.operationId;
    });
>>>>>>> cdm-dev
  }
}

// <ng-container *ngIf="(operation$ | async) as operation">
//   <table-selectable-rows
//     [dataSource]="participants$"
//     [columns]="tableColumns"
//     [route]="['/operations', operation.id, 'participants']">
//   </table-selectable-rows>
// </ng-container>
