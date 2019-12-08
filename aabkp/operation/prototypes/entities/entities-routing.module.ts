import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityFormComponent } from './entity-form/entity-form.component';

import { operationAdminRoute, adminRoute } from '../../admin.utils';

const routes: Routes = [
  // adminRoute('eprototypes/:id', EntityFormComponent),
  // operationAdminRoute('eprototypes', EntityListComponent),
  // operationAdminRoute('eprototype', EntityFormComponent)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityPrototypesRoutingModule { }
