import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticatedGuard } from '@hpc/core';

import { DashboardComponent } from './dashboard.component';

const route = (path, component) => {
  return {path, component, canActivate: [AuthenticatedGuard]}
}

const routes: Routes = [
  route('', DashboardComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
