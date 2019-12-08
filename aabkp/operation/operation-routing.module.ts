import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperationComponent } from './operation.component';
import { AttachmentListComponent } from './prototypes/attachments/attachment-list/attachment-list.component';
import { AttachmentFormComponent } from './prototypes/attachments/attachment-form/attachment-form.component';

import { AuthenticatedGuard, AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: OperationComponent,
    children: [
      { path: ':id/aprototypes', component: AttachmentListComponent, canActivate: [AdminGuard] },
      { path: ':id/aprototypes/new', component: AttachmentFormComponent, canActivate: [AdminGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationRoutingModule { }
