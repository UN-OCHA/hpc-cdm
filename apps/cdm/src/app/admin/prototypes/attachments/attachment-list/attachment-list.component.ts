import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';
import { Operation, AttachmentPrototype } from '@hpc/data';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'attachment-prototypes',
  templateUrl: './attachment-list.component.html',
  styleUrls: [ './attachment-list.component.scss' ]
})
export class AttachmentListComponent implements OnInit {
  tableColumns = [
    {columnDef: 'refCode', header: 'Refcode', cell: (row) => `${row.refCode}`},
    {columnDef: 'type', header: 'Type', cell: (row) => `${row.type}`}
  ];
  operation$ = this.appService.operation$;
  prototypes$ = this.appService.attachmentPrototypes$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService,
    private appService: AppService) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.modeService.mode = data.mode;
    });

    this.activatedRoute.parent.params.subscribe(params => {
      console.log(params)
      this.appService.loadAttachmentPrototypes(params.id);
    });
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
      // this.appService.loadAttachmentPrototypes(params.id);
    });
  }
}


// expandedElement: any | null;
// titleExpanded = false;

// <!-- Grid Section -->
// <div class="row mt-3">
//   <div class="col-sm-12">
//     <div class="table-responsive">
//       <table class="table table-striped table-bordered tblGrid" *ngIf="prototypes?.length > 0">
//         <thead>
//           <tr class="bg-light">
//             <th colspan="6" class="text-right"></th>
//           </tr>
//           <tr class="bg-light">
//             <th width="30%">refCode</th>
//             <th width="60%">Type</th>
//             <th width="10%">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr *ngFor="let prototype of mf.data">
//             <td>{{prototype.refCode}}</td>
//             <td>{{prototype.type}}</td>
//             <td align="center"><a href="javascript:;" class="editIcon" title="Edit"
//                 [routerLink]="['/operations/aprototypes', operationId, prototype.id]"><i class="material-icons">edit</i></a>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//       <div *ngIf="prototypes?.length ==0" class="text-danger">
//         No attachment prototypes Found..
//       </div>
//     </div>
//   </div>
// </div>
// <!-- Grid Section -->
