import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminGuard } from '@hpc/core';

import { ReportingWindowsComponent } from './reporting-windows.component';
import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { DataQueueComponent } from './data-queue/data-queue.component';
// import { RWindowDetailComponent } from './detail/detail.component';
// import { RWindowElementsComponent } from './elements/elements.component';
// import { RWindowWorkflowComponent } from './workflow/workflow.component';



const routes: Routes = [
  {
    path: '', component: ReportingWindowsComponent, canActivate: [AdminGuard],
    children: [
      { path: '', component: ReportingWindowListComponent },
      { path: 'new', component: ReportingWindowFormComponent },
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
export class ReportingWindowsRoutingModule { }

// import { PendingChangesGuard } from 'app/shared/services/auth/pendingChanges.guard.service';
