import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { BlueprintResolver } from './blueprint-resolver.service';
import { BlueprintsComponent } from './blueprints.component';
import { BlueprintListComponent } from './blueprint-list/blueprint-list.component';
import { BlueprintFormComponent } from './blueprint-form/blueprint-form.component';
import { AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: BlueprintsComponent,
    canActivate: [AdminGuard],
    // canActivateChildren: [AdminGuard],
    children: [
<<<<<<< HEAD
      { path: '', component: BlueprintListComponent },
      {
        path: 'new',
        component: BlueprintFormComponent,
        data: { mode: 'add' }
      },
      {
        path: ':id',
        component: BlueprintFormComponent,
        data: { mode: 'edit' }
      }
    ]}
=======
      { path: '', component: BlueprintListComponent, canActivate: [AdminGuard] },
      { path: 'new', component: BlueprintFormComponent, canActivate: [AdminGuard] },
      { path: ':copy/:id', component: BlueprintFormComponent, canActivate: [AdminGuard] },
      { path: ':id', component: BlueprintFormComponent, canActivate: [AdminGuard] }
    ],
    data: { roles: ['hpcadmin'], }
  }
>>>>>>> cdm-dev
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlueprintsRoutingModule { }
