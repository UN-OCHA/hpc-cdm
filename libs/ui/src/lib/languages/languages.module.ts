import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatMenuModule, MatButtonModule } from '@angular/material';

import { LanguagesComponent } from './languages.component';

@NgModule({
  declarations: [
    LanguagesComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    LanguagesComponent
  ]
})
export class LanguagesModule {}
