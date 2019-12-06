import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { DashboardComponent } from './dashboard.component';

@Injectable({providedIn: 'root'})
export class DashboardGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): Observable<boolean> {
    return of(this.auth.isAuthenticated());
  }
}

const route = (path, component) => {
  return {path, component, canActivate: [DashboardGuard]}
}

const routes: Routes = [
  route('', DashboardComponent),
  route('dashboard', DashboardComponent)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
