import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { ReviewComponent } from './review.component';

@NgModule({
  declarations: [
    ReviewComponent,
  ],
  imports: [
    CommonModule, RouterModule, DragDropModule,
    FormsModule, ReactiveFormsModule, IconSpriteModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    ReviewComponent,
  ]
})
export class ReviewModule { }
