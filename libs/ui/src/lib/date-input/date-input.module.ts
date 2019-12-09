import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { DateInputComponent } from './date-input.component';

@NgModule({
  declarations: [
    DateInputComponent
  ],
  imports: [
    CommonModule, FlexLayoutModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    DateInputComponent
  ]
})
export class DateInputModule {
}

// <div class="date-input">
// <label>{{label}}</label> <i *ngIf="required && !disabled" class="text-danger">*</i>
