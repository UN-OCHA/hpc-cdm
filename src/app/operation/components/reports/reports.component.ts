import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/shared/services/operation.service';
import { ReportsService } from '../../services/reports.service';

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
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
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
        console.log('getting attachments for operations.............')
        this.reports.stepIdx = 0;
        this.operation.getAttachments(params.id);
        this.title = 'Operation Attachments';
      }
    });
  }
}
