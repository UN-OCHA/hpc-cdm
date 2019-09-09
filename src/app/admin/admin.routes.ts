import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO put these two things in a "shared" place?
import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';

import { AdminPageComponent } from './components/adminPage/adminPage.component';
import { AdminObjectListComponent } from './components/adminObjectList/adminObjectList.component';
import { AdminObjectComponent } from './components/adminObject/adminObject.component';
import {ListparticipantComponent} from './components/listparticipant/listparticipant.component';
import {ListblueprintComponent} from './components/listblueprint/listblueprint.component';
import {BlueprintFormComponent} from './components/blueprintForm/blueprintForm.component';
import {ListAttachmentPrototypeComponent} from './components/listAttachmentPrototype/listAttachmentPrototype.component';
import {AttachmentPrototypeFormComponent} from './components/attachmentPrototypeForm/attachmentPrototypeForm.component';
import {ListEntityPrototypeComponent} from './components/listEntityPrototype/listEntityPrototype.component';
import {EntityPrototypeFormComponent} from './components/entityPrototypeForm/entityPrototypeForm.component';
import {AddparticipantComponent} from './components/addparticipant/addparticipant.component';
import {EditparticipantComponent} from './components/editparticipant/editparticipant.component';

const route = (path, component, roles=['hpcadmin', 'prismadmin']) => {
  return { path, component, canActivate: [AuthGuard],
    data: { title: 'Admin', roles }};
};

const adminRoutes: Routes = [
  route('admin', AdminPageComponent),
  route('admin/participants', ListparticipantComponent),
  route('admin/operations/:id/attachmentprotos', ListAttachmentPrototypeComponent),
  route('admin/operations/:id/entityprotos', ListEntityPrototypeComponent),
  route('admin/attachmentprotos/:id', AttachmentPrototypeFormComponent),
  route('admin/attachmentproto', AttachmentPrototypeFormComponent),
  route('admin/entityprotos/:id', EntityPrototypeFormComponent),
  route('admin/entityproto', EntityPrototypeFormComponent),
  route('admin/blueprints', ListblueprintComponent),
  route('admin/blueprints/:id', BlueprintFormComponent),
  route('admin/blueprint', BlueprintFormComponent),
  route('admin/addparticipant',AddparticipantComponent),
  route('admin/editparticipant/:id', EditparticipantComponent),
  route('admin/:object', AdminObjectListComponent),
  route('admin/:object?page=:page', AdminObjectListComponent),
  route('admin/:object/:id', AdminObjectComponent)
];

export const adminRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(adminRoutes);
