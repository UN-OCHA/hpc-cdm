import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlueprintListComponent } from './blueprint-list/blueprint-list.component';
import { BlueprintFormComponent } from './blueprint-form/blueprint-form.component';

import { adminRoute } from '../admin.utils';

const routes: Routes = [
  adminRoute('blueprints', BlueprintListComponent),
  adminRoute('blueprints/:id', BlueprintFormComponent),
  adminRoute('blueprint', BlueprintFormComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class BlueprintsRoutingModule { }
