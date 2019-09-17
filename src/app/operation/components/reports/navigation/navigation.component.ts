import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'reports-nav',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class ReportsNavigationComponent implements OnInit {
  steps = [];

  constructor(
    private operation: OperationService,
    private reports: ReportsService) {
  }

  ngOnInit() {
    this.steps = [
      {
        name: 'Operation',
        title: 'Operation Attachments',
        route: `/operation/${this.operation.id}/reports`
      },
      {
        name: 'HCT/ICCGs',
        title: 'HCT/ICCGs',
        route: `/operation/${this.operation.id}/entityreports`
      }
    ]
  }

  nextStep() {
    this.reports.stepIdx += 1;
  }

  prevStep() {
    this.reports.stepIdx -= 1;
  }
}
