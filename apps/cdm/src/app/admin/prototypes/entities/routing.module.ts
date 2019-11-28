import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityFormComponent } from './entity-form/entity-form.component';

import { operationAdminRoute } from '../../admin.utils';

const routes: Routes = [
  operationAdminRoute('eprototypes', EntityListComponent),
  operationAdminRoute('eprototypes/:entityPrototypeId', EntityFormComponent),
  operationAdminRoute('eprototype', EntityFormComponent)
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class EntityPrototypesRoutingModule { }
