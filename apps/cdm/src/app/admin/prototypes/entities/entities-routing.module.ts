import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntitiesComponent } from './entities.component';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityFormComponent } from './entity-form/entity-form.component';

import { AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: EntitiesComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: EntityListComponent },
      { path: 'new', component: EntityFormComponent },
      { path: ':id', component: EntityFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitiesRoutingModule { }
