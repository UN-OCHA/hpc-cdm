import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttachmentsComponent } from './attachments.component';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './attachment-form/attachment-form.component';

import { AuthenticatedGuard, AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: AttachmentsComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AttachmentListComponent },
      { path: 'new', component: AttachmentFormComponent },
      { path: ':id', component: AttachmentFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttachmentsRoutingModule { }
