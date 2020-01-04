import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';

import { DataQueueModule } from './data-queue';
import { ReportingWindowComponent } from './reporting-window.component';
import { ReportingWindowFormModule } from '../reporting-window-form';
import { ReportingWindowStatesComponent } from './reporting-window-states';
import { ReportingWindowRoutingModule } from './reporting-window-routing.module';
import { ReportingWindowMenuModule } from '../reporting-window-menu';

@NgModule({
  declarations: [
    ReportingWindowComponent,
    ReportingWindowStatesComponent,
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
    ReportingWindowMenuModule,
    DataQueueModule,
    ReportingWindowFormModule,
    ReportingWindowRoutingModule
  ],
  exports: [
    ReportingWindowComponent,
    ReportingWindowStatesComponent,
  ],
  providers: [
    // ModeService
  ]
})
export class ReportingWindowModule { }
