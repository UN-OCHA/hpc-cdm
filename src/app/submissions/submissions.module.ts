import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionsComponent } from './submissions.component';
import { submissionsRoutes } from './submissions.routes';

@NgModule({
  imports: [CommonModule, submissionsRoutes],
  declarations: [SubmissionsComponent]
})
export default class SubmissionsModule{}
