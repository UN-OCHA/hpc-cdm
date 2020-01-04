import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';

import { ReportingWindowListComponent } from './reporting-window-list.component';
import { ReportingWindowMenuModule } from '../reporting-window-menu';

@NgModule({
  declarations: [
    ReportingWindowListComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReportingWindowMenuModule
  ],
  exports: [
    ReportingWindowListComponent,
  ],
})
export class ReportingWindowListModule { }
