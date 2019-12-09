import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CdkStepperModule } from '@angular/cdk/stepper';

import { ReportsComponent } from './reports.component';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportNavComponent } from './report-nav/report-nav.component';
import { EntitiesComponent } from './entities/entities.component';
import { AttachmentViewComponent } from './attachment-view/attachment-view.component';

import { ReportsRoutingModule } from './reports-routing.module';


import { CdmUIModule } from '@cdm/ui';


@NgModule({
  declarations: [
    AttachmentViewComponent,
    EntitiesComponent,
    ReportsComponent,
    ReportListComponent,
    ReportNavComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CdkStepperModule,
    CdmUIModule,
    FormsModule, ReactiveFormsModule,
    ReportsRoutingModule
  ],
})
export class ReportsModule { }
