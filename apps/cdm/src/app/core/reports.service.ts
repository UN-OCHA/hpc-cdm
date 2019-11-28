import { Injectable } from '@angular/core';
import { ApiService } from '@hpc/core';
import { OperationService } from './operation/operation.service';

@Injectable({providedIn: 'root'})
export class ReportsService {
  public stepIdx = 0;

  constructor(
    private operation: OperationService,
    private api: ApiService) {}

  public saveReport(opAttachmentId, submission, comments, finalized = false) {
    return this.api.saveReport({
      id: this.operation.report && this.operation.report.id,
      operationId: this.operation.id,
      reportingWindowId: this.operation.reportingWindow.id,
      opAttachmentId,
      dataReportVersion: {
        value: {
          submission, comments, finalized
        }
      }
    });
  }
}
