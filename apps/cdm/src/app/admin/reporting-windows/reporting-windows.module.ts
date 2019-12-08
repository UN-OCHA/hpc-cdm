import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';

import { DataQueueModule } from './data-queue/data-queue.module';
import { ReportingWindowsComponent } from './reporting-windows.component';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
import { ReportingWindowsRoutingModule } from './reporting-windows-routing.module';
import { ReportingWindowsService } from './reporting-windows.service';

@NgModule({
  declarations: [
    ReportingWindowsComponent,
    ReportingWindowFormComponent,
    ReportingWindowListComponent,
    ReportingWindowStatesComponent,
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
    DataQueueModule,
    ReportingWindowsRoutingModule
  ],
  exports: [
    ReportingWindowListComponent
  ],
  providers: [
    ReportingWindowsService
  ]
})
export class ReportingWindowsModule { }
