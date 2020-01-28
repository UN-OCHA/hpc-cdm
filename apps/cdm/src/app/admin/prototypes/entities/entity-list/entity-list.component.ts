import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService, ApiService } from '@hpc/core';
import { EntityPrototype } from '@hpc/data';
import { OperationService } from '@cdm/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'entity-prototypes',
  templateUrl: './entity-list.component.html',
  styleUrls: [ './entity-list.component.scss' ]
})
export class EntityListComponent implements OnInit {
  public loading = false;
  prototypes: EntityPrototype[] = [];
  tableColumns = [
    {columnDef: 'refCode', header: 'Refcode', cell: (row) => `${row.refCode}`},
    {columnDef: 'type', header: 'Type', cell: (row) => `${row.type}`},
    {columnDef: 'action', header: 'Action', cell: (row) => `${row.id}`}
  ];
  columnsToDisplay = ['refCode', 'type', 'action']
  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService,
    private toastr: ToastrService,
    private api: ApiService,
    private operationService: OperationService) {}

  ngOnInit() {
    this.modeService.mode = 'list';
    this.loading = true;
    this.activatedRoute.params.subscribe(params => {
      this.operationService.loadEntityPrototypes(params.id);
    });

    this.operationService.entityPrototypes$.subscribe(protos => {
      this.prototypes = protos;
      this.loading = false;
    });
  }
  deleteEntity(prototype) {
    Swal.fire({
      title: 'Are you sure want to delete?',
      text: 'You will not be able to recover once delete this entity!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.api.deleteOperationEntity(prototype.id).subscribe(response => {
        if(response.status !== 'ok') {
          this.toastr.error('Unable to delete entity');
        } else {
          this.activatedRoute.params.subscribe(params => {
            this.operationService.loadEntityPrototypes(params.id);
          });

          this.operationService.entityPrototypes$.subscribe(protos => {
            this.prototypes = protos;
          });
          this.toastr.success('Operation entity is removed');
        }
        this.loading = false;
      });
    }
  })
  }
}
