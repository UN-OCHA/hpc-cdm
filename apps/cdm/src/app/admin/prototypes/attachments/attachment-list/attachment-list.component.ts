import { Component, OnInit } from '@angular/core';
import { OperationService } from '@cdm/core';
import { ModeService, ApiService } from '@hpc/core';
import { Operation, AttachmentPrototype } from '@hpc/data';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'attachment-prototypes',
  templateUrl: './attachment-list.component.html',
  styleUrls: [ './attachment-list.component.scss' ]
})
export class AttachmentListComponent implements OnInit {
  public loading = false;
  operation: Operation;
  prototypes: AttachmentPrototype[] = [];
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
    this.getAttachments();
  }
  getAttachments() {
    this.loading = true;
    this.activatedRoute.params.subscribe(params => {
      this.operationService.loadAttachmentPrototypes(params.id);
    });

    this.operationService.attachmentPrototypes$.subscribe(protos => {
      this.prototypes = protos;
    });

    this.operationService.operation$.subscribe(operation => {
      this.operation = operation;
      this.loading = false;
    });
  }
  deleteAttachment(prototype) {
    Swal.fire({
      title: 'Are you sure want to delete?',
      text: 'You will not be able to recover once delete this attachment!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.api.deleteOperationPrototypeAttachment(prototype.id).subscribe(response => {
        if(response.status !== 'ok') {
          this.toastr.error('Unable to delete attachment');
          throw new Error('Unable to delete attachment');
        } else {
          this.activatedRoute.params.subscribe(params => {
            this.operationService.loadAttachmentPrototypes(params.id);
          });

          this.operationService.attachmentPrototypes$.subscribe(protos => {
            this.prototypes = protos;
          });
          this.toastr.success('Operation attachment is removed');
        }
        this.loading = false;
      });
    }
  })
  }
}
