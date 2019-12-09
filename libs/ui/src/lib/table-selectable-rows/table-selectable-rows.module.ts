import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@hpc/material';

import { TableSelectableRowsComponent } from './table-selectable-rows.component';


@NgModule({
  declarations: [
    TableSelectableRowsComponent
  ],
  imports: [
    CommonModule, RouterModule,
    MaterialModule
  ],
  exports: [
    TableSelectableRowsComponent
  ]
})
export class TableSelectableRowsModule {
}
