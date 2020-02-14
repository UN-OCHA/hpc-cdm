import { Component, OnInit, ViewChild,  } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< HEAD
import {animate, state, style, transition, trigger} from '@angular/animations';
import { AppService, ModeService } from '@hpc/core';
=======
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApiService, ModeService } from '@hpc/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
>>>>>>> cdm-dev

const MAX_LENGTH = 280;
export interface BluePrintData {
  name: string;
  description: string;
  status: string;
  type: string;
}

@Component({
  selector: 'blueprints',
  templateUrl: './blueprint-list.component.html',
  styleUrls: ['./blueprint-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class BlueprintListComponent implements OnInit {
<<<<<<< HEAD
  blueprints$ = this.appService.blueprints$;
=======
  public loading = false;
  blueprints: any[];
>>>>>>> cdm-dev
  columnsToDisplay = ['name', 'description', 'status', 'type', 'actions'];
  dataSource: MatTableDataSource<BluePrintData>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
<<<<<<< HEAD
    private appService: AppService,
    private modeService: ModeService,
    private router: Router
=======
    private service: ModeService,
    public apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
>>>>>>> cdm-dev
  ) {
  }

  ngOnInit() {
<<<<<<< HEAD
    this.modeService.mode = 'list';
    this.appService.loadBlueprints();
=======
    this.loading = true;
    this.service.mode = 'list';
    this.apiService.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints.map(bp => {
        if(bp.description.length > MAX_LENGTH) {
          bp.description = bp.description.substring(0, MAX_LENGTH) + '...';
        }
        return bp;
      });
      this.setBlueprintData();
      this.loading = false;
    });
>>>>>>> cdm-dev
  }
  deleteBlueprint(blueprint: any) {
<<<<<<< HEAD
    this.appService.deleteBlueprint(blueprint.id);
=======
    Swal.fire({
      title: 'Are you sure want to delete?',
      text: 'You will not be able to recover once delete this blueprint!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        return this.apiService.deleteBlueprint(blueprint.id)
        .subscribe(response => {
          if (response.status === 'ok') {
            this.blueprints.splice(this.blueprints.indexOf(blueprint), 1);
            this.setBlueprintData();
            this.toastr.success('Blueprint removed');
            this.loading = false;
          }
        });
      }
    })
>>>>>>> cdm-dev
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  private setBlueprintData() {
    this.blueprints.sort((originalData, sortingData)=> {return sortingData.id - originalData.id});
    this.dataSource = new MatTableDataSource(this.blueprints);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

<<<<<<< HEAD





// <div *ngIf="blueprints$?.length ==0" class="text-danger">
//   No blueprints Found..
// </div>














// <td align="center">
//   <a href class="editIcon" title="Edit"
//     [routerLink]="['/blueprints',blueprint.id]"><i class="material-icons">edit</i>
//   </a>
//   <a class="editIcon clickable" title="Edit" (click)="deleteBlueprint(blueprint)"><i class="material-icons">delete</i>
//   </a>
// </td>



// <table *ngIf="blueprints" mat-table [dataSource]="blueprints" multiTemplateDataRows class="mat-elevation-z8">
//   <ng-container matColumnDef="name">
//     <th mat-header-cell *matHeaderCellDef>
//       <cdm-page title="Blueprints">
//         <div actions>
//           <button mat-raised-button color="warn" routerLink="/blueprint">Add Blueprint</button>
//         </div>
//       </cdm-page>
//     </th>
//   </ng-container>
// </table>
=======
>>>>>>> cdm-dev
