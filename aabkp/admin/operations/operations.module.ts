import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperationPublishComponent } from './operation-publish/operation-publish.component';

import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';
import { OperationsRoutingModule } from './operations-routing.module';

@NgModule({
  declarations: [
    OperationPublishComponent
  ],
  imports: [
    CommonModule,
    UIModule, CdmUIModule,
    // OperationsRoutingModule
  ],
  exports: [
    OperationPublishComponent
  ]
})
export class OperationsModule { }
