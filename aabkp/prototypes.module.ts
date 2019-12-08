import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdmUIModule } from '@cdm/ui';
import { MaterialModule } from '@hpc/material';
import { AttachmentListComponent } from './attachments/attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './attachments/attachment-form/attachment-form.component';
import { EntityListComponent } from './entities/entity-list/entity-list.component';
import { EntityFormComponent } from './entities/entity-form/entity-form.component';

@NgModule({
  declarations: [
    AttachmentListComponent,
    AttachmentFormComponent,
    EntityListComponent,
    EntityFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, MaterialModule
  ],
  exports: [
    AttachmentListComponent,
    AttachmentFormComponent,
    EntityListComponent,
    EntityFormComponent,
  ]
})
export class PrototypesModule { }
