import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';

import { PaginatedTableComponent } from './paginated-table.component';


@NgModule({
  declarations: [
    PaginatedTableComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    PaginatedTableComponent
  ]
})
export class PaginatedTableModule {}
