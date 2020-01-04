import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminGuard } from '@hpc/core';

import { ReportingWindowComponent } from './reporting-window.component';
import { ReportingWindowStatesComponent } from './reporting-window-states';
import { ReportingWindowFormComponent } from '../reporting-window-form';
import { DataQueueComponent } from './data-queue/data-queue.component';


const routes: Routes = [
  {
    path: '', component: ReportingWindowComponent, canActivate: [AdminGuard],
    children: [
      // { path: '', component: ReportingWindowFormComponent },
      // { path: 'new', component: ReportingWindowFormComponent },
      { path: ':id', component: ReportingWindowFormComponent },
    ]
  }

  // { path: '', component: ReportingWindowListComponent },
  // route('windows/:id/states', ReportingWindowStatesComponent),
  // route('windows/:id/queue', DataQueueComponent),
  // route('windows/:id', ReportingWindowFormComponent),
  //
  // route('window', ReportingWindowFormComponent)
];
  //    [{path: '', redirectTo: 'detail', pathMatch: 'full'},
  //     {path: 'detail', component: RWindowDetailComponent} ]),
  // route('rwindows/:id/edit', RWindowFormComponent,
  //    [{path: '', redirectTo: 'detail', pathMatch: 'full' },
  //     {path: 'detail', component: RWindowDetailComponent},
  //     {path: 'elements', component: RWindowElementsComponent},
  //     {path: 'workflow', component: RWindowWorkflowComponent}]),
  // route('windows/:id/queue', DataQueueComponent)
    // canDeactivate: [PendingChangesGuard], ????????????

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingWindowRoutingModule { }
