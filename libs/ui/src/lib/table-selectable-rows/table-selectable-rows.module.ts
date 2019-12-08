import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material';

import { TableSelectableRowsComponent } from './table-selectable-rows.component';


@NgModule({
  declarations: [
    TableSelectableRowsComponent
  ],
  imports: [
    CommonModule,
    // BrowserAnimationsModule,
    MatTableModule
  ],
  exports: [
    TableSelectableRowsComponent
  ]
})
export class TableSelectableRowsModule {
}
