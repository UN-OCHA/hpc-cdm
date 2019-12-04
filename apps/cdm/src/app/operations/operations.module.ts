import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';

import { OperationsRoutingModule } from './operations-routing.module';
import { OperationStepperComponent } from './operation-stepper/operation-stepper.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationItemComponent } from './operation-item/operation-item.component';

import { OperationFormModule } from './operation-form/operation-form.module';
import { OperationFormComponent } from './operation-form/operation-form.component';

import { TranslatorModule } from '@hpc/core';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '../ui/cdm-ui.module';

@NgModule({
  declarations: [
    OperationStepperComponent,
    OperationListComponent,
    OperationItemComponent,
  ],
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    // BrowserAnimationsModule,
    UIModule, CdmUIModule, TranslatorModule,
    MaterialModule,
    OperationFormModule,
    OperationsRoutingModule,
  ],
  exports: [
    OperationListComponent,
    OperationFormComponent
  ]
})
export class OperationsModule { }
