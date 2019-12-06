import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperationStepperComponent } from '../operation-stepper/operation-stepper.component';

const routes: Routes = [
  {
    path: '',
    component: OperationStepperComponent,
    children: [
      {
        path: 'xxx',
        loadChildren: '../operation-form/operation-form.module#OperationFormModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationStepperRoutingModule { }
