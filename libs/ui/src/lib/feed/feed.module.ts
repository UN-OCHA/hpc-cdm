import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FeedComponent } from './feed.component';

@NgModule({
  declarations: [
    FeedComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FontAwesomeModule
  ],
  exports: [
    FeedComponent,
  ]
})
export class FeedModule { }
