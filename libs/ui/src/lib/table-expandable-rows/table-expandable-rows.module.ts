import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material';

import { TableExpandableRowsComponent } from './table-expandable-rows.component';


@NgModule({
  declarations: [
    TableExpandableRowsComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatTableModule
  ],
  exports: [
    TableExpandableRowsComponent
  ]
})
export class TableExpandableRowsModule {
}
