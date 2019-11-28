import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OperationPublishComponent } from './operation-publish/operation-publish.component';

import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';
import { OperationsRoutingModule } from './routing.module';

@NgModule({
  declarations: [
    OperationPublishComponent
  ],
  imports: [
    CommonModule, RouterModule,
    UIModule, CdmUIModule,
    OperationsRoutingModule
  ],
  exports: [
    OperationPublishComponent
  ]
})
export class OperationsModule { }
