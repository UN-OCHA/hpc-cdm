import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperationsComponent } from './operations.component';
import { OperationComponent } from './operation/operation.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationAddComponent } from './operation-add/operation-add.component';
// import { OperationFormComponent } from './operation-form/operation-form.component';

import { AuthenticatedGuard, AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: OperationsComponent,
    children: [
      { path: '', component: OperationListComponent, canActivate: [AuthenticatedGuard] },
      { path: 'new', component: OperationAddComponent, canActivate: [AdminGuard] },
    ]
  },
  {
    path: ':operationId',
    component: OperationComponent,
    children: [
      {
        path: '',
        loadChildren: './operation-stepper/operation-stepper.module#OperationStepperModule'
      },
      {
        path: 'aprototypes',
        loadChildren: '../admin/prototypes/attachments/attachments.module#AttachmentPrototypesModule',
      },
      {
        path: 'eprototypes',
        loadChildren: '../admin/prototypes/entities/entities.module#EntityPrototypesModule',
      },
      {
        path: 'participants',
        loadChildren: '../admin/participants/participants.module#ParticipantsModule',
      },
      {
        path: 'versions',
        loadChildren: '../admin/versions/versions.module#VersionsModule',
      },
      {
        path: 'reports',
        loadChildren: '../reports/reports.module#ReportsModule',
      },
      {
        path: 'plans',
        loadChildren: '../plans/plans.module#PlansModule',
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationsRoutingModule { }
