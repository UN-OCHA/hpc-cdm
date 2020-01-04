import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@hpc/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteSelectComponent } from './autocomplete-select.component';

@NgModule({
  declarations: [
    AutocompleteSelectComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MaterialModule, FlexLayoutModule
  ],
  exports: [
    AutocompleteSelectComponent
  ]
})
export class AutocompleteSelectModule {
}
