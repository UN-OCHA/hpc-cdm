import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { ApiService } from '@hpc/core';
import { ReportingWindow } from '@hpc/data';
import { DataQueueService } from './data-queue.service';

@Component({
  selector: 'app-data-queue',
  templateUrl: './data-queue.component.html',
  styleUrls: ['./data-queue.component.scss']
})
export class DataQueueComponent implements OnInit {
  reportingWindow: ReportingWindow;
<<<<<<< HEAD:apps/cdm/src/app/admin/reporting-windows/reporting-window/data-queue/data-queue.component.ts
=======
  loading;
>>>>>>> cdm-dev:apps/cdm/src/app/admin/reporting-windows/data-queue/data-queue.component.ts

  constructor(
    private queue: DataQueueService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {

      //TODO what service?
      // this.api.getReportingWindow(params.id).subscribe(rw => {
      //   rw.name = 'RW Name';
      //   this.reportingWindow = rw;
      // });

      this.queue.loadDataEntries(params.id);
    });
  }
}
