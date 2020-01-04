import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';

import { ReportingWindowsComponent } from './reporting-windows.component';
import { ReportingWindowListModule } from './reporting-window-list';
import { ReportingWindowFormModule } from './reporting-window-form';
import { ReportingWindowMenuModule } from './reporting-window-menu';
import { ReportingWindowsRoutingModule } from './reporting-windows-routing.module';


@NgModule({
  declarations: [
    ReportingWindowsComponent,
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
    ReportingWindowMenuModule,
    ReportingWindowListModule,
    ReportingWindowFormModule,
    ReportingWindowsRoutingModule
  ],
  exports: [
    ReportingWindowsComponent
  ],
  providers: [
    ModeService
  ]
})
export class ReportingWindowsModule { }
