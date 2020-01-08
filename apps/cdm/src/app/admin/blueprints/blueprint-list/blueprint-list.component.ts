import { Component, OnInit, ViewChild,  } from '@angular/core';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApiService, ModeService } from '@hpc/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
  public loading = false;
  blueprints: any[];
  columnsToDisplay = ['name', 'description', 'status', 'type', 'actions'];
  dataSource: MatTableDataSource<BluePrintData>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private service: ModeService,
    public apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
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
  }
  deleteBlueprint(blueprint: any) {
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

