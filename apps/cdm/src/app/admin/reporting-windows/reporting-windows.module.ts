import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportingWindowsComponent } from './reporting-windows.component';
<<<<<<< HEAD
import { ReportingWindowListModule } from './reporting-window-list';
import { ReportingWindowFormModule } from './reporting-window-form';
import { ReportingWindowMenuModule } from './reporting-window-menu';
=======
import { ReportingWindowMenuComponent } from './reporting-window-menu/reporting-window-menu.component';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
>>>>>>> cdm-dev
import { ReportingWindowsRoutingModule } from './reporting-windows-routing.module';


@NgModule({
  declarations: [
    ReportingWindowsComponent,
<<<<<<< HEAD
=======
    ReportingWindowMenuComponent,
    ReportingWindowFormComponent,
    ReportingWindowListComponent,
    ReportingWindowStatesComponent,
>>>>>>> cdm-dev
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
<<<<<<< HEAD
    ReportingWindowMenuModule,
    ReportingWindowListModule,
    ReportingWindowFormModule,
    ReportingWindowsRoutingModule
  ],
  exports: [
    ReportingWindowsComponent
=======
    DataQueueModule,
    ReportingWindowsRoutingModule,
    FormsModule, ReactiveFormsModule
  ],
  exports: [
    ReportingWindowMenuComponent,
    ReportingWindowListComponent
>>>>>>> cdm-dev
  ],
  providers: [
    ModeService,
    DatePipe
  ]
})
export class ReportingWindowsModule { }
