import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MaterialModule } from '../../../../material/material.module';
import { MaterialModule } from '@hpc/material';

import { InputComponent } from './input.component';

@NgModule({
  declarations: [
    InputComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  exports: [
    InputComponent
  ]
})
export class InputModule {}
