import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { OperationComponent } from './operation.component';
import { AttachmentListComponent } from './prototypes/attachments/attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './prototypes/attachments/attachment-form/attachment-form.component';
import { OperationRoutingModule } from './operation-routing.module';

@NgModule({
  declarations: [
    OperationComponent,
    AttachmentListComponent,
    AttachmentFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, UIModule, MaterialModule,
    OperationRoutingModule
  ],
  exports: [
    OperationComponent,
    AttachmentListComponent,
    AttachmentFormComponent,    
  ]
})
export class OperationModule { }
