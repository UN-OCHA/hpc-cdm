import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';

import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowsRoutingModule } from './routing.module';

@NgModule({
  declarations: [
    ReportingWindowFormComponent,
    ReportingWindowListComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    CdmUIModule, MaterialModule,
    ReportingWindowsRoutingModule
    // DataQueueModule
  ],
  exports: [
    ReportingWindowListComponent
  ]
})
export class ReportingWindowsModule { }
