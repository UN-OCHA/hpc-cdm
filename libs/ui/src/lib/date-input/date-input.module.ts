import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule, MatFormFieldModule } from '@angular/material';

import { DateInputComponent } from './date-input.component';

@NgModule({
  declarations: [
    DateInputComponent
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule
  ],
  exports: [
    DateInputComponent
  ]
})
export class DateInputModule {
}
