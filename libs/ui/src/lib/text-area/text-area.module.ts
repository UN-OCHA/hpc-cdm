import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@hpc/material';

import { TextAreaComponent } from './text-area.component';

@NgModule({
  declarations: [
    TextAreaComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
  ],
  exports: [
    TextAreaComponent
  ]
})
export class TextAreaModule {}
