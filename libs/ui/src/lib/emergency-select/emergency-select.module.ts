import { NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { EmergencySelectComponent } from './emergency-select.component';

@NgModule({
  declarations: [
    EmergencySelectComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MaterialModule, FlexLayoutModule
  ],
  exports: [
    EmergencySelectComponent
  ]
})
export class EmergencySelectModule {
  @Input() label?;
  @Input() required? = false;
}
