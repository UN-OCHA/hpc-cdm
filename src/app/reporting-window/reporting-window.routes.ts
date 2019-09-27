import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';
import { PendingChangesGuard } from 'app/shared/services/auth/pendingChanges.guard.service';

import { ReportingWindowListComponent } from './components/reporting-window-list/reporting-window-list.component';
import { CreateReportingWindowComponent } from './components/edit/create-reporting-window/create-reporting-window.component';
import { ReportingWindowDetailComponent } from './components/edit/reporting-window-detail/reporting-window-detail.component';
import { ReportingWindowElementsComponent } from './components/edit/reporting-window-elements/reporting-window-elements.component';
import { ReportingWindowWorkflowComponent } from './components/edit/reporting-window-workflow/reporting-window-workflow.component';
import { DataQueueComponent } from './components/data-queue/data-queue.component';


//  TODO: check why canDeactivate: [PendingChangesGuard] is not working here
const reportingWindowRoutes: Routes = [
  { path: 'reporting-window',
    component: ReportingWindowListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Reporting windows' } },
  { path: 'reporting-window/create',
    component: CreateReportingWindowComponent,
    canActivate: [AuthGuard],
    data: { title: 'Create Reporting Window' },
    children: [ {
        path: '',
        redirectTo: 'detail',
        pathMatch: 'full'
      }, {
        path: 'detail',
        component: ReportingWindowDetailComponent,
      } ],
  },
  { path: 'reporting-window/:id/edit',
    component: CreateReportingWindowComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Operation' },
    children: [{
        path: '',
        redirectTo: 'detail',
        pathMatch: 'full'
      }, {
        path: 'detail',
        component: ReportingWindowDetailComponent,
      }, {
       path: 'elements',
       component: ReportingWindowElementsComponent
      }, {
       path: 'workflow',
       component: ReportingWindowWorkflowComponent
      }
    ]
  },
  { path: 'reporting-window/:id/data-queue',
    component: DataQueueComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard],
    data: { title: 'Operation Reporting' }
  },
];

export const mapRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(reportingWindowRoutes);
