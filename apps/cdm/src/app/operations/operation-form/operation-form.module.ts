import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';
import { NgxLoadingModule } from 'ngx-loading';

import { OperationFormComponent } from './operation-form.component';

@NgModule({
  declarations: [
    OperationFormComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    MaterialModule, FlexLayoutModule,
    NgxLoadingModule,
    UIModule
  ],
  exports: [
    OperationFormComponent,
  ]
})
export class OperationFormModule { }
