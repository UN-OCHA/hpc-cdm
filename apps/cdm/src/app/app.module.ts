import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { UIModule } from '@hpc/ui';
import { AuthService } from '@hpc/core';
import { MaterialModule } from  '@hpc/material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';


import 'font-awesome/css/font-awesome.css';

const ROUTES = [];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CdkStepperModule,
    IconSpriteModule.forRoot({ path: '../assets/sprites/sprite.svg' }),
    UIModule,
    MaterialModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    })
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}
