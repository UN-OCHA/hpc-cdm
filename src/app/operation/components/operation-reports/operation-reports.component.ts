import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../services/operation.service';

@Component({
  selector: 'operation-reports',
  templateUrl: './operation-reports.component.html',
  styleUrls: ['./operation-reports.component.scss'],
  providers: [OperationService]
})
export class OperationReportsComponent implements OnInit {

  constructor(
    private operation: OperationService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.getAttachments(params.id);
    });
  }
}
