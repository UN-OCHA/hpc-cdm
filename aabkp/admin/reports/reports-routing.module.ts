import { NgModule, Injectable } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { ReportListComponent } from './report-list/report-list.component';
import { operationAdminRoute } from '../admin.utils';

@Injectable({providedIn: 'root'})
export class ReportingWindowGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): Observable<boolean> {
    return of(this.auth.isAuthenticated() && this.auth.user && this.auth.user.isAdmin);
  }
}

const route = (path, component, children=[]) => {
  const r: any = { path, component, canActivate: [ReportingWindowGuard] };
  if(children) {
    r.children = children;
  }
  return r;
}

const routes: Routes = [
  // operationAdminRoute('reports', ReportListComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
