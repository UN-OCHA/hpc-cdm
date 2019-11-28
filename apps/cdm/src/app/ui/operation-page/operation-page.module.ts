import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

import { OperationPageComponent } from './operation-page.component';
import { OperationPageHeaderComponent } from './operation-page-header/header.component';

@NgModule({
  declarations: [
    OperationPageComponent,
    OperationPageHeaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    OperationPageComponent,
    OperationPageHeaderComponent
  ]
})
export class CdmUIModule { }
