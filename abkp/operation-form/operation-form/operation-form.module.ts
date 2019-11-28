import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OperationFormComponent } from './form/form.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    OperationFormComponent
  ]
})
export class OperationFormModule { }
