import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule'},
  // {path: 'operations', loadChildren: './operations/operations.module#OperationsModule'}
  // { path: '', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
  // { path: 'operations', loadChildren: './operations/operations.module#OperationsModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
