import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { OperationsComponent } from './operations.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationAddComponent } from './operation-add/operation-add.component';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationsRoutingModule } from './operations-routing.module';

import { OperationModule } from './operation/operation.module';

@NgModule({
  declarations: [
    OperationsComponent,
    OperationListComponent,
    OperationAddComponent,
    OperationFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, UIModule, MaterialModule,
    OperationModule,
    OperationsRoutingModule
  ],
  exports: [
    OperationsComponent,
    OperationListComponent,
    OperationAddComponent,
    OperationFormComponent,
  ],
  providers: [
    ModeService
  ]
})
export class OperationsModule { }
