import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { OperationAddComponent } from './operation-add/operation-add.component';
// import { OperationListComponent } from './operation-list/operation-list.component';
// import { OperationStepperComponent } from './operation-stepper/operation-stepper.component';


@Injectable({providedIn: 'root'})
export class OperationsGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): Observable<boolean> {
    // console.log(this.auth.isAuthenticated() && this.auth.user)
    return of(this.auth.isAuthenticated());
    // return of(true);
  }
}

const route = (path, component) => {
  return {path, component, canActivate: [OperationsGuard]}
}

const routes: Routes = [
  // { path: '', component: OperationListComponent,  }
  // route('operations', OperationListComponent),
  // route('operations/:id', OperationStepperComponent),
  // { path: 'operations/:id',
  //   loadChildren: './operation-stepper/operation-stepper.module#OperationStepperModule'},
  // route('operation', OperationAddComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationsRoutingModule { }
