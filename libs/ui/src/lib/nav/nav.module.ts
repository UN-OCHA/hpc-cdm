import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDividerModule } from '@angular/material';
import { FeedModule } from '../feed/feed.module';
import { NavComponent } from './nav.component';

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    FeedModule
  ],
  exports: [
    NavComponent,
  ]
})
export class NavModule { }
