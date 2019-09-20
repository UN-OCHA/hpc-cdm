import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { ReportsService } from '../../services/reports.service';

const TITLES = [
  'Operation Attachments',
  'HCT/ICCGs Attachments'
];

const ROUTES_STEPS = {
  '/reports': 0,
  '/entityreports': 1
};

const findStep = (url) => {
  const route = Object.keys(ROUTES_STEPS).filter(k => url.endsWith(k));
  return ROUTES_STEPS[route[0]];
};

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  title: string;

  constructor(
    private operation: OperationService,
    private reports: ReportsService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    const stepIdx = findStep(this.router.url);
    this.title = TITLES[stepIdx];
    this.reports.stepIdx = stepIdx;
    this.activatedRoute.params.subscribe(params => {
      switch(stepIdx) {
        case 0:
          this.operation.getAttachments(params.id);
          return;
        case 1:
          this.operation.getEntities(params.id);
      }
    });
  }
}
