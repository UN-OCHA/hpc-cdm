import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { LoginLinkModule } from '@hpc/ui';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    LoginLinkModule,
    HomeRoutingModule,
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule {}
