import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from '@hpc/ui';
// import { OperationsModule } from './operations/operations.module';
// import { BlueprintsModule } from './blueprints/blueprints.module';
import { BlueprintListComponent } from './blueprints/blueprint-list/blueprint-list.component';
import { AttachmentPrototypesModule } from './prototypes/attachments/attachments.module';
import { EntityPrototypesModule } from './prototypes/entities/entities.module';
import { ReportingWindowsModule } from './reporting-windows/reporting-windows.module';
import { ReportingWindowListComponent } from './reporting-windows/reporting-window-list/reporting-window-list.component';
import { PlansModule } from './plans/plans.module';
import { ParticipantsModule } from './participants/participants.module';
import { ReportsModule } from './reports/reports.module';


@NgModule({
  imports: [
    CommonModule,
    UIModule,
    AttachmentPrototypesModule,
    // BlueprintsModule,
    EntityPrototypesModule,
    // OperationsModule,
    ReportingWindowsModule,
    PlansModule,
    ParticipantsModule,
    ReportsModule
  ],
  exports: [
    BlueprintListComponent,
    ReportingWindowListComponent
  ]
})
export class AdminModule { }
