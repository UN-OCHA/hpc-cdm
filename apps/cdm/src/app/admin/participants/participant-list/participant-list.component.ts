import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
import { AppService, ModeService } from '@hpc/core';

import { UserService, UserQuery } from './user.service';
import { PaginatedDataSource } from './paginated-datasource';
import { User } from './user';

@Component({
  selector: 'participant-list',
  templateUrl: './participant-list.component.html',
  styleUrls: [ './participant-list.component.scss' ]
})
export class ParticipantListComponent {//implements OnInit {
  // tableColumns = [];
  // operation$ = this.appService.operation$;
  // participants$ = this.appService.participants$;
  //
  // constructor(
  //   private modeService: ModeService,
  //   private appService: AppService,
  //   private activatedRoute: ActivatedRoute){
  // }
  //
  // ngOnInit() {
  //   this.modeService.mode = 'list';
  //   this.activatedRoute.params.subscribe(params => {
  //     this.appService.loadParticipants(params.id);
  //   });
  // }

  displayedColumns = ['id', 'name', 'email', 'registration']

  data = new PaginatedDataSource<User, UserQuery> (
    (request, query) => this.users.page(request, query),
    {property: 'username', order: 'desc'},
    {search: '', registration: undefined},
    5
  );

  // constructor(private users: UserService) {}
  constructor(private users: UserService) {
    console.log(users)
    // this.users = users;
  }
}

// <ng-container *ngIf="(operation$ | async) as operation">
//   <table-selectable-rows
//     [dataSource]="participants$"
//     [columns]="tableColumns"
//     [route]="['/operations', operation.id, 'participants']">
//   </table-selectable-rows>
// </ng-container>
