import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UIModule } from '@hpc/ui';
import { AuthService } from '@hpc/core';
import { MaterialModule } from  '@hpc/material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';



import 'font-awesome/css/font-awesome.css';

const ROUTES = [];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    UIModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}
