import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { LocationSelectComponent } from './location-select.component';

@NgModule({
  declarations: [
    LocationSelectComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    LocationSelectComponent
  ]
})
export class LocationSelectModule {

}
