import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO put these two things in a "common" place?
import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';
import { PendingChangesGuard } from 'app/shared/services/auth/pendingChanges.guard.service';

import { CreateOperationComponent } from './components/edit/create-operation/create-operation.component';

import { BasicOperationInfoComponent } from './components/edit/basic-operation-info/basic-operation-info.component';
import { ReviewComponent } from './components/edit/review/review.component';
import { GoverningEntitiesInfoComponent } from './components/edit/governing-entities-info/governing-entities-info.component';

const operationRoutes: Routes = [
  { path: 'operation',
    redirectTo: 'operation/create'
  },
  { path: 'operation/create',
    component: CreateOperationComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard],
    data: { title: 'Create Operation' },
    children: [ {
        path: '',
        redirectTo: 'basic',
        pathMatch: 'full'
      }, {
        path: 'basic',
        component: BasicOperationInfoComponent,
      } ],
  },
  { path: 'operation/:id/edit',
    component: CreateOperationComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard],
    data: { title: 'Edit Operation' },
    children: [{
        path: '',
        redirectTo: 'basic',
        canDeactivate: [PendingChangesGuard],
        pathMatch: 'full'
      }, {
        path: 'basic',
        canDeactivate: [PendingChangesGuard],
        component: BasicOperationInfoComponent,
      }, {
        path: 'gve/:type',
        canDeactivate: [PendingChangesGuard],
        component: GoverningEntitiesInfoComponent,
        children: [{
          path: 'attachments',
          canDeactivate: [PendingChangesGuard],
          component: GoverningEntitiesInfoComponent,
        }],
      }, {
        path: 'review',
        component: ReviewComponent,
      }
    ]
  },
  { path: 'operation/:id/view/:tab',
    component: CreateOperationComponent,
    canActivate: [],
    data: { title: 'View Operation' },
    children: [{
          path: '',
          component: ReviewComponent,
          pathMatch: 'full'
    }] },
  { path: 'operation/:id/view',
    component: CreateOperationComponent,
    canActivate: [],
    data: { title: 'View Operation' },
    children: [{
          path: '',
          component: ReviewComponent,
    }] }
];

export const operationRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(operationRoutes);
