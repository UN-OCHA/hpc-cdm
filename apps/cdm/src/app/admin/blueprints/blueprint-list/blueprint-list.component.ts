import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ApiService, ModeService } from '@hpc/core';
// import { ToastrService } from 'ngx-toastr';


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
  blueprints: any[];
  columnsToDisplay = ['name', 'description', 'status', 'type', 'actions'];
  expandedElement: any | null;

  limit: number = 10;
  full: boolean = false;

  constructor(
    private service: ModeService,
    public apiService: ApiService,
    private router: Router
    // private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.service.mode = 'list';
    this.apiService.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints;
    });
  }

  capitalized(s) {
    return s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();
  }

  deleteBlueprint(blueprint: any) {
    return this.apiService.deleteBlueprint(blueprint.id)
      .subscribe(response => {
        if (response.status === 'ok') {
          this.blueprints.splice(this.blueprints.indexOf(blueprint), 1);
          // return this.toastr.success('Blueprint removed.', 'Blueprint removed');
        }
      });
  }

  handleScroll = (scrolled: boolean) => {
    console.timeEnd('lastScrolled');
    // scrolled ? this.getData() : _noop();
    console.time('lastScrolled');
  }

  hasMore = () => {
    // !this.dataSource || this.dataSource.data.length < this.limit;
    return false;
  }

}


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
