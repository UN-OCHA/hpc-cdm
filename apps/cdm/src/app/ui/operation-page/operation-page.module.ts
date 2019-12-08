import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { UIModule } from '@hpc/ui';
// import { CdmPageModule } from '../cdm-page/cdm-page.module';

import { OperationPageComponent } from './operation-page.component';
import { OperationTitleModule } from '../operation-title/operation-title.module';
import { OperationMenuModule } from '../operation-menu/operation-menu.module';

@NgModule({
  declarations: [
    OperationPageComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule, UIModule,
    OperationTitleModule, OperationMenuModule
  ],
  exports: [
    OperationPageComponent
  ]
})
export class OperationPageModule { }
