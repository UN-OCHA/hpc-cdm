import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { ReportsService } from '../../services/reports.service';

// const findStep = (url) => {
  // const route = Object.keys(ROUTES_STEPS).filter(k => url.endsWith(k));
  // return ROUTES_STEPS[route[0]];
// };

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  title: string;
  operationId: number;
  entityPrototypeId: number;

  constructor(
    private operation: OperationService,
    private reports: ReportsService,
    // private router: Router,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    console.log('----------------------------')
    this.activatedRoute.params.subscribe(params => {
      this.operationId = params.id;
      this.entityPrototypeId = params.entityPrototypeId;
      if(params.entityPrototypeId) {
        this.operation.getEntities(params.entityPrototypeId, params.id);
        this.operation.entityPrototypes$.subscribe(response => {
          response.forEach((ep, idx) => {
            if(ep.id == params.entityPrototypeId) {
              this.reports.stepIdx = idx + 1;
              // TODO adjust locale
              this.title = ep.value.name.en.plural;
            }
          })
        });
      } else {
        this.reports.stepIdx = 0;
        this.operation.getAttachments(params.id);
        this.title = 'Operation Attachments';
      }
    });
  }
}
