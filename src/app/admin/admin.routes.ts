import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO put these two things in a "shared" place?
import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';

import { AdminPageComponent } from './components/adminPage/adminPage.component';
import { AdminObjectListComponent } from './components/adminObjectList/adminObjectList.component';
import { AdminObjectComponent } from './components/adminObject/adminObject.component';
import {ListparticipantComponent} from './components/listparticipant/listparticipant.component';
import {ListblueprintComponent} from './components/listblueprint/listblueprint.component';
import {AddparticipantComponent} from './components/addparticipant/addparticipant.component';
import {EditparticipantComponent} from './components/editparticipant/editparticipant.component';
const adminRoutes: Routes = [
  { path: 'admin',
    component: AdminPageComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
    { path: 'admin/participants',
    component: ListparticipantComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
    { path: 'admin/blueprints',
    component: ListblueprintComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
    { path: 'admin/addparticipant',
    component: AddparticipantComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
    { path: 'admin/editparticipant/:id',
    component: EditparticipantComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
    { path: 'admin/:object',
    component: AdminObjectListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
  { path: 'admin/:object?page=:page',
    component: AdminObjectListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin', 'roles': ['hpcadmin', 'prismadmin'] }},
  { path: 'admin/:object/:id',
    component: AdminObjectComponent,
    canActivate: [AuthGuard],
    data: { 'roles': ['hpcadmin', 'prismadmin'] }},

];

export const adminRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(adminRoutes);
