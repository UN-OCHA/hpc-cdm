import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlueprintsComponent } from './blueprints.component';
import { BlueprintListComponent } from './blueprint-list/blueprint-list.component';
import { BlueprintFormComponent } from './blueprint-form/blueprint-form.component';
import { AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: BlueprintsComponent,
    children: [
      { path: '', component: BlueprintListComponent, canActivate: [AdminGuard] },
      { path: 'new', component: BlueprintFormComponent, canActivate: [AdminGuard] },
      { path: ':id', component: BlueprintFormComponent, canActivate: [AdminGuard] }
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlueprintsRoutingModule { }
