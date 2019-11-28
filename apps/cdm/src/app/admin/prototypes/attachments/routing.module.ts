import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './attachment-form/attachment-form.component';

import { operationAdminRoute } from '../../admin.utils';

const routes: Routes = [
  operationAdminRoute('aprototypes', AttachmentListComponent),
  operationAdminRoute('aprototypes/:attachmentPrototypeId', AttachmentFormComponent),
  operationAdminRoute('aprototype', AttachmentFormComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class AttachmentPrototypesRoutingModule { }
