import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { AttachmentEntryComponent } from './attachment-entry.component';

@NgModule({
  declarations: [
    AttachmentEntryComponent
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    AttachmentEntryComponent,
  ]
})
export class AttachmentEntryModule { }
