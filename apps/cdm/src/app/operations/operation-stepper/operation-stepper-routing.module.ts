import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService, AuthenticatedGuard, AdminGuard } from '@hpc/core';

import { OperationStepperComponent } from './operation-stepper.component';
import { OperationFormComponent } from '../operation-form/operation-form.component';
import { OperationAttachmentsComponent } from './operation-attachments/operation-attachments.component';
import { EntityAttachmentsComponent } from './entity-attachments/entity-attachments.component';
import { OperationEntitiesComponent } from './operation-entities/operation-entities.component';
// import { ReviewComponent } from './review/review.component';


const routes: Routes = [
  {
    path: '', component: OperationStepperComponent, canActivate: [AdminGuard],
    children: [
      { path: '', component: OperationFormComponent,  },
      { path: 'details', component: OperationFormComponent },
      { path: 'attachments', component: OperationAttachmentsComponent },
      { path: 'entities/:entityId', component: OperationEntitiesComponent },
      { path: 'entities/:entityId/attachments', component: EntityAttachmentsComponent },
      // { path: 'review', component: ReviewComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationStepperRoutingModule { }
