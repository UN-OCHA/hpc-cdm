import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'reports-nav',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class ReportsNavigationComponent implements OnInit {
  steps = [];
  operationId: number;
  entityPrototypeId: number;

  constructor(
    private operation: OperationService,
    private reports: ReportsService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationId = params.id;
      this.entityPrototypeId = params.entityPrototypeId;
      this.steps = [{
        name: 'Operation',
        title: 'Operation Attachments',
        route: `/operation/${this.operation.id}/reports`,
        id: undefined
      }];
      this.operation.getEntityPrototypes();
      this.operation.entityPrototypes$.subscribe(response => {
        response.forEach((ep, idx) => {
          if(this.steps.filter(s => s.name === ep.value.name.en.plural).length === 0) {
            this.steps.push({
              name: ep.value.name.en.plural,
              title: ep.value.name.en.plural,
              route: `/operation/${this.operation.id}/entityreports/${ep.id}`,
              id: ep.id
            });
          }
        });
      });
    });
  }

  nextStep() {
    this.reports.stepIdx += 1;
  }

  prevStep() {
    this.reports.stepIdx -= 1;
  }
}
