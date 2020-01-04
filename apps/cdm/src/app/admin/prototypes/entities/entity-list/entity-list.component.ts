import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, ModeService } from '@hpc/core';
import { EntityPrototype } from '@hpc/data';


@Component({
  selector: 'entity-prototypes',
  templateUrl: './entity-list.component.html',
  styleUrls: [ './entity-list.component.scss' ]
})
export class EntityListComponent implements OnInit {
  tableColumns = [
    {columnDef: 'refCode', header: 'Refcode', cell: (row) => `${row.refCode}`},
    {columnDef: 'type', header: 'Type', cell: (row) => `${row.type}`}
  ];
  operation$ = this.appService.operation$;
  prototypes$ = this.appService.entityPrototypes$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService,
    private appService: AppService) {}

  ngOnInit() {
    this.modeService.mode = 'list';
    this.activatedRoute.params.subscribe(params => {
      this.appService.loadEntityPrototypes(params.id);
    });
  }
}


// <th width="30%">refCode</th>
// <th width="60%">Type</th>
// <th width="10%">Action</th>

//
// <tr *ngFor="let prototype of mf.data">
//   <td>{{prototype.refCode}}</td>
//   <td>{{prototype.type}}</td>
//   <td align="center"><a href="javascript:;" class="editIcon" title="Edit"
//       [routerLink]="['/admin/operations/entityproto',operationId,prototype.id]"><i class="material-icons">edit</i></a>
//   </td>
// </tr>
//
// <div *ngIf="prototypes?.length ==0" class="text-danger">
// No entity prototypes Found..
// </div>
