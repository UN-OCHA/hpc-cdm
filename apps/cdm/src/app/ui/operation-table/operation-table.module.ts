import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule, MatButtonModule, MatIconModule } from '@angular/material';

import { OperationTableComponent } from './operation-table.component';
import { CdmPageModule } from '../cdm-page/cdm-page.module';
import { OperationTitleModule } from '../operation-title/operation-title.module';
import { OperationMenuModule } from '../operation-menu/operation-menu.module';

@NgModule({
  declarations: [
    OperationTableComponent,
  ],
  imports: [
    CommonModule, RouterModule, BrowserAnimationsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    CdmPageModule, OperationTitleModule, OperationMenuModule
  ],
  exports: [
    OperationTableComponent
  ]
})
export class OperationTableModule { }
