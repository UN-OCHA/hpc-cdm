import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO put these two things in a "shared" place?
import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';

import {ListblueprintComponent} from './components/listblueprint/listblueprint.component';
import {BlueprintFormComponent} from './components/blueprintForm/blueprintForm.component';
import {ListAttachmentPrototypeComponent} from './components/listAttachmentPrototype/listAttachmentPrototype.component';
import {AttachmentPrototypeFormComponent} from './components/attachmentPrototypeForm/attachmentPrototypeForm.component';
import {ListEntityPrototypeComponent} from './components/listEntityPrototype/listEntityPrototype.component';
import {EntityPrototypeFormComponent} from './components/entityPrototypeForm/entityPrototypeForm.component';

const route = (path, component, roles=['hpcadmin', 'prismadmin']) => {
  return { path, component, canActivate: [AuthGuard],
    data: { title: 'Admin', roles }};
};

const adminRoutes: Routes = [
  route('admin/operations/:id/attachmentprotos', ListAttachmentPrototypeComponent),
  route('admin/operations/:id/entityprotos', ListEntityPrototypeComponent),
  route('admin/operations/attachmentproto/:operationId', AttachmentPrototypeFormComponent),
  route('admin/operations/attachmentproto/:operationId/:id', AttachmentPrototypeFormComponent),
  route('admin/operations/entityproto/:operationId', EntityPrototypeFormComponent),
  route('admin/operations/entityproto/:operationId/:id', EntityPrototypeFormComponent),
  route('admin/blueprints', ListblueprintComponent),
  route('admin/blueprints/:id', BlueprintFormComponent),
  route('admin/blueprint', BlueprintFormComponent),
];

export const adminRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(adminRoutes);
