import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';

import { DataQueueModule } from './data-queue/data-queue.module';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
import { ReportingWindowsRoutingModule } from './reporting-windows-routing.module';

@NgModule({
  declarations: [
    ReportingWindowFormComponent,
    ReportingWindowListComponent,
    ReportingWindowStatesComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    CdmUIModule, MaterialModule,
    DataQueueModule,
    ReportingWindowsRoutingModule
  ],
  exports: [
    ReportingWindowListComponent
  ]
})
export class ReportingWindowsModule { }
