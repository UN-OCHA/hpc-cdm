import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppService } from './app.service'
import { OperationService } from './operation/operation.service'
import { ReportingWindowService } from './reporting-window.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    AppService,
    OperationService,
    ReportingWindowService
  ]
})
export class CoreModule { }
