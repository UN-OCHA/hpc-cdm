import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';

import { ReportingWindowMenuComponent } from './reporting-window-menu.component';

@NgModule({
  declarations: [
    ReportingWindowMenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
  ],
  exports: [
    ReportingWindowMenuComponent,
  ],
})
export class ReportingWindowMenuModule { }
