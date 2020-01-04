import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';

import { ReportingWindowFormComponent } from './reporting-window-form.component';


@NgModule({
  declarations: [
    ReportingWindowFormComponent,
  ],
  imports: [
    CommonModule,
    CdmUIModule, MaterialModule,
    RouterModule
  ],
  exports: [
    ReportingWindowFormComponent
  ],
  providers: [
    ModeService
  ]
})
export class ReportingWindowFormModule { }
