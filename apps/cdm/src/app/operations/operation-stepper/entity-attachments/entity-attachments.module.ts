import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { AttachmentEntryModule } from '../attachment-entry/attachment-entry.module';
import { EntityEntryModule } from '../entity-entry/entity-entry.module';
import { EntityAttachmentsComponent } from './entity-attachments.component';
import { EntityAttachmentsHeaderComponent } from './header/entity-attachments-header.component';

@NgModule({
  declarations: [
    EntityAttachmentsComponent,
    EntityAttachmentsHeaderComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule, IconSpriteModule,
    AttachmentEntryModule, EntityEntryModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    EntityAttachmentsComponent,
    EntityAttachmentsHeaderComponent,
  ]
})
export class EntityAttachmentsModule { }
