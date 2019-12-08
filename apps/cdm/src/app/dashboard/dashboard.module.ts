import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
import { MatIconModule, MatButtonModule } from '@angular/material';

// import { AdminModule } from '../admin/admin.module';
// import { OperationsModule } from '../operations/operations.module';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '../ui/cdm-ui.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    // RouterModule,
    // AdminModule,
    // OperationsModule,
    MatButtonModule, MatIconModule,
    UIModule, CdmUIModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
