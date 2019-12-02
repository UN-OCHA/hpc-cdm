import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatTableModule } from '@angular/material';

import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

import { AttachmentFormComponent } from './attachment-form/attachment-form.component';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';

import { AttachmentPrototypesRoutingModule } from './attachments-routing.module';

@NgModule({
  declarations: [
    AttachmentFormComponent,
    AttachmentListComponent
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatTableModule,
    UIModule, CdmUIModule,
    AttachmentPrototypesRoutingModule
  ],
  exports: [
    AttachmentFormComponent,
    AttachmentListComponent
  ],
})
export class AttachmentPrototypesModule { }
