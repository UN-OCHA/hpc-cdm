import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@hpc/core';
import { AppService, OperationService, ReportsService } from '@cdm/core';

@Component({
  selector: 'report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  title: string;
  // operationId: number;
  entityPrototypeId: number;

  constructor(
    private app: AppService,
    private operationService: OperationService,
    private authService: AuthService,
    private reports: ReportsService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.operationService.route = 'REPORTS_VIEW';
    // this.operationId = params.id;
    // this.entityPrototypeId = params.entityPrototypeId;

    // if(params.entityPrototypeId) {
    //   this.operationService.loadEntities(params.entityPrototypeId, params.id);
    //   this.operationService.entityPrototypes$.subscribe(response => {
    //     response.forEach((ep, idx) => {
    //       if(ep.id == params.entityPrototypeId) {
    //         this.reports.stepIdx = idx + 1;
    //         // TODO adjust locale
    //         this.title = ep.value.name.en.plural;
    //       }
    //     })
    //   });
    // } else {
      // console.log(params)
      this.reports.stepIdx = 0;
      this.operationService.loadAttachments(2);
      this.title = 'Operation Attachments';
    // }

    this.operationService.selectedEntity$.subscribe(entity => {
      if(entity) {
        this.operationService.loadEntityAttachments(entity.id);
      }
    });
  }
}
