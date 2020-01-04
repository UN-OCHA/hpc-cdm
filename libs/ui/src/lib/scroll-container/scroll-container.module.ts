import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollContainerComponent } from './scroll-container.component';

@NgModule({
  declarations: [
    ScrollContainerComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ScrollContainerComponent
  ]
})
export class ScrollContainerModule {}
