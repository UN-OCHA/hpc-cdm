import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'operations',
    loadChildren: './operations/operations.module#OperationsModule'
  },
  {
    path: 'blueprints',
    loadChildren: './admin/blueprints/blueprints.module#BlueprintsModule'
  },
  {
    path: 'windows',
    loadChildren: './admin/reporting-windows/reporting-windows.module#ReportingWindowsModule'
  },
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
//
// const routes: Routes = [
//   { path: 'operations', loadChildren: () => import(`./operations/operations.module`).then(m => m.OperationsModule) },
//   { path: 'dashboard', loadChildren: () => import(`./dashboard/dashboard.module`).then(m => m.DashboardModule) },
//   { path: 'blueprints', loadChildren: () => import(`./admin/blueprints/blueprints.module`).then(m => m.BlueprintsModule) },
//   { path: 'windows', loadChildren: () => import(`./admin/reporting-windows/reporting-windows.module`).then(m => m.ReportingWindowsModule) },
//   { path: '', loadChildren: () => import(`./home/home.module`).then(m => m.HomeModule) },
// ];
//
// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
