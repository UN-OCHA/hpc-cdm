import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material';

import { LogoComponent } from './logo.component';

@NgModule({
  declarations: [
    LogoComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule
  ],
  exports: [
    LogoComponent
  ]
})
export class LogoModule {}
