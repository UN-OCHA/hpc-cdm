import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataQueueModule } from './data-queue/data-queue.module';
import { ReportingWindowsComponent } from './reporting-windows.component';
import { ReportingWindowMenuComponent } from './reporting-window-menu/reporting-window-menu.component';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
import { ReportingWindowsRoutingModule } from './reporting-windows-routing.module';


@NgModule({
  declarations: [
    ReportingWindowsComponent,
    ReportingWindowMenuComponent,
    ReportingWindowFormComponent,
    ReportingWindowListComponent,
    ReportingWindowStatesComponent,
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
    DataQueueModule,
    ReportingWindowsRoutingModule,
    FormsModule, ReactiveFormsModule
  ],
  exports: [
    ReportingWindowMenuComponent,
    ReportingWindowListComponent
  ],
  providers: [
    ModeService,
    DatePipe
  ]
})
export class ReportingWindowsModule { }
