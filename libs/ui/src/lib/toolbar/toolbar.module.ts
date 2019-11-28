import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material';
import { LoginLinkModule } from '../login-link/login-link.module';
import { LanguagesModule } from '../languages/languages.module';
import { ToolbarComponent } from './toolbar.component';


@NgModule({
  declarations: [
    ToolbarComponent,
  ],
  imports: [
    CommonModule,
    LanguagesModule,
    LoginLinkModule,
    MatMenuModule,
  ],
  exports: [
    ToolbarComponent
  ]
})
export class ToolbarModule { }
