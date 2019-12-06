import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
// import { IconSpriteModule } from 'ng-svg-icon-sprite';
// import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

import { OperationStepperRoutingModule } from './operation-stepper-routing.module';
import { OperationStepperComponent } from './operation-stepper.component';
import { OperationFormModule } from '../operation-form/operation-form.module';

@NgModule({
  declarations: [OperationStepperComponent],
  imports: [
    CommonModule,
    MaterialModule, CdmUIModule,

    OperationFormModule,
    OperationStepperRoutingModule
  ]
})
export class OperationStepperModule { }
