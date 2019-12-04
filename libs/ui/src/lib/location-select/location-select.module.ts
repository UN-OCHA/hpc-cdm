import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationSelectComponent } from './location-select.component';

@NgModule({
  declarations: [
    LocationSelectComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    LocationSelectComponent
  ]
})
export class LocationSelectModule {

}
