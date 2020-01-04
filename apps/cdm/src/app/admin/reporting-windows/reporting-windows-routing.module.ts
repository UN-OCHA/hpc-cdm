import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminGuard } from '@hpc/core';

import { ReportingWindowsComponent } from './reporting-windows.component';
import { ReportingWindowListComponent } from './reporting-window-list';
import { ReportingWindowFormComponent } from './reporting-window-form';


const routes: Routes = [
  {
    path: '', component: ReportingWindowsComponent, canActivate: [AdminGuard],
    children: [
      { path: '', component: ReportingWindowListComponent },
      { path: 'new', component: ReportingWindowFormComponent },
      {
        path: ':id',
        loadChildren: './reporting-window/reporting-window.module#ReportingWindowModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingWindowsRoutingModule { }
