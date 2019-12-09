import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MaterialModule } from '@hpc/material';
import { CustomStepperComponent } from './stepper.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CustomStepperComponent
  ],
  imports: [
    CommonModule, RouterModule,
    CdkStepperModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule
  ],
  exports: [
    CustomStepperComponent
  ]
})
export class CustomStepperModule { }
