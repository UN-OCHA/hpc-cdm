import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';

import { TableExpandableRowsComponent } from './table-expandable-rows.component';


@NgModule({
  declarations: [
    TableExpandableRowsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    TableExpandableRowsComponent
  ]
})
export class TableExpandableRowsModule {}
