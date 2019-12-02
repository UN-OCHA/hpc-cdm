import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@hpc/material';

import { OperationsRoutingModule } from './operations-routing.module';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationItemComponent } from './operation-item/operation-item.component';
// import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationFormModule } from './operation-form/operation-form.module';

import { TranslatorModule } from '@hpc/core';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '../ui/cdm-ui.module';

@NgModule({
  declarations: [
    OperationListComponent,
    OperationItemComponent,
    // OperationFormComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    // BrowserAnimationsModule,
    UIModule, CdmUIModule, TranslatorModule,
    MaterialModule,
    OperationsRoutingModule,
    OperationFormModule
  ],
  exports: [
    OperationListComponent
  ]
})
export class OperationsModule { }
