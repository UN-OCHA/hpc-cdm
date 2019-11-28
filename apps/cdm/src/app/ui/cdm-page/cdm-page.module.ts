import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CdmPageComponent } from './cdm-page.component';


@NgModule({
  declarations: [
    CdmPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CdmPageComponent
  ]
})
export class CdmPageModule { }
