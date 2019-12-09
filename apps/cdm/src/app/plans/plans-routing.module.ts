import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService, AuthenticatedGuard, AdminGuard } from '@hpc/core';

import { PlansComponent } from './plans.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { PlanFormComponent } from './plan-form/plan-form.component';


const routes: Routes = [
  { path: '', component: PlansComponent, children: [
      { path: '', component: PlanListComponent, canActivate: [AuthenticatedGuard] },
      { path: 'new', component: PlanFormComponent, canActivate: [AdminGuard] },
      { path: ':id', component: PlanFormComponent, canActivate: [AdminGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlansRoutingModule { }
