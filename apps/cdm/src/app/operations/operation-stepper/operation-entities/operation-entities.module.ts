import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { OperationEntitiesComponent } from './operation-entities.component';
import { OperationEntitiesHeaderComponent } from './header/operation-entities-header.component';
import { EntityEntryModule } from '../entity-entry/entity-entry.module';

@NgModule({
  declarations: [
    OperationEntitiesComponent,
    OperationEntitiesHeaderComponent,
  ],
  imports: [
    CommonModule, RouterModule, DragDropModule,
    FormsModule, ReactiveFormsModule, IconSpriteModule,
    EntityEntryModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    OperationEntitiesComponent,
    OperationEntitiesHeaderComponent,
  ],
  providers: [
    ModeService
  ]
})
export class OperationEntitiesModule { }
