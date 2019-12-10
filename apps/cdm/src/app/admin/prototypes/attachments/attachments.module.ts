import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { MaterialModule } from '@hpc/material';
import { AttachmentsRoutingModule } from './attachments-routing.module';
import { AttachmentsComponent } from './attachments.component';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './attachment-form/attachment-form.component';

@NgModule({
  declarations: [
    AttachmentsComponent,
    AttachmentListComponent,
    AttachmentFormComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule, FormsModule, ReactiveFormsModule,
    CdmUIModule, MaterialModule,
    AttachmentsRoutingModule
  ],
  exports: [
    AttachmentsComponent,
    AttachmentListComponent,
    AttachmentFormComponent,
  ],
  providers: [
    ModeService
  ]
})
export class AttachmentPrototypesModule { }
