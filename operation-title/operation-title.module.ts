import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

import { OperationTitleComponent } from './operation-title.component';


@NgModule({
  declarations: [
    OperationTitleComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
  ],
  exports: [
    OperationTitleComponent
  ]
})
export class OperationTitleModule { }
