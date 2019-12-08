import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { EntityEntryComponent } from './entity-entry.component';
import { EntityEntryIconComponent } from './icon/entity-entry-icon.component';

@NgModule({
  declarations: [
    EntityEntryIconComponent,
    EntityEntryComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IconSpriteModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    EntityEntryIconComponent,
    EntityEntryComponent,
  ]
})
export class EntityEntryModule { }
