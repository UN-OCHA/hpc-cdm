import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@hpc/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteSingleComponent } from './autocomplete-single.component';

@NgModule({
  declarations: [
    AutocompleteSingleComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MaterialModule, FlexLayoutModule
  ],
  exports: [
    AutocompleteSingleComponent
  ]
})
export class AutocompleteSingleModule {
}
