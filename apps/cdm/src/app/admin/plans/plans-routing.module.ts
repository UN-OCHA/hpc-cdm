import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { PlanFormComponent } from './plan-form/plan-form.component';
import { PlanListComponent } from './plan-list/plan-list.component';

import { operationAdminRoute } from '../admin.utils';


@Injectable({providedIn: 'root'})
export class PlansGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): Observable<boolean> {
    // console.log(this.auth.isAuthenticated() && this.auth.user)
    return of(this.auth.isAuthenticated());
    // return of(true);
  }
}

const route = (path, component) => {
  return {path, component, canActivate: [PlansGuard]}
}

const routes: Routes = [
  operationAdminRoute('plans', PlanListComponent),
  operationAdminRoute('plan', PlanFormComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class PlansRoutingModule { }
