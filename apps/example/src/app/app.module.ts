import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from "@angular/core";
import { MaterialModule } from  '@hpc/material';

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { UIModule } from '@hpc/ui';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    UIModule,
    RouterModule.forRoot([], { initialNavigation: "enabled" }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
