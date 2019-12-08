import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@hpc/material';
import { UIModule } from '@hpc/ui';

import { WindowPageComponent } from './window-page.component';

@NgModule({
  declarations: [
    WindowPageComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    // BrowserAnimationsModule,
    MaterialModule, UIModule
  ],
  exports: [
    WindowPageComponent
  ]
})
export class WindowPageModule { }
