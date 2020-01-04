import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperationService } from './operation/operation.service'
import { ReportingWindowService } from './reporting-window.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    OperationService,
    ReportingWindowService
  ]
})
export class CoreModule { }
