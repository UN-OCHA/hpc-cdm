import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { OperationAttachmentsComponent } from './operation-attachments.component';

@NgModule({
  declarations: [
    OperationAttachmentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, UIModule, MaterialModule,
  ],
  exports: [
    OperationAttachmentsComponent
  ],
  providers: [
    ModeService
  ]
})
export class OperationAttachmentsModule { }
