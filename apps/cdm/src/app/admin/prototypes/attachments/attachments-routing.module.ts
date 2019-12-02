import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './attachment-form/attachment-form.component';

import { operationAdminRoute, adminRoute } from '../../admin.utils';

const routes: Routes = [
  adminRoute('aprototypes/:id', AttachmentFormComponent),
  operationAdminRoute('aprototypes', AttachmentListComponent),
  operationAdminRoute('aprototype', AttachmentFormComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class AttachmentPrototypesRoutingModule { }
