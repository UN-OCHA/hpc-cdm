import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationListComponent } from './operation-list/operation-list.component';


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
  route('operations', OperationListComponent),
  route('operation', OperationFormComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class OperationsRoutingModule { }
