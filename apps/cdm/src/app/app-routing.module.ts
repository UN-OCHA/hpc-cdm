import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
// import { CanActivate, RouterModule, Routes } from '@angular/router';
// import { BlueprintListComponent } from './admin/blueprints/blueprint-list/blueprint-list.component';
import { RouterModule, Routes } from '@angular/router';
// import { Observable, of } from 'rxjs';
// import { AuthService } from '@hpc/core';
// import { OperationListComponent } from './operations/operation-list/operation-list.component';

// @Injectable({providedIn: 'root'})
// export class OperationsGuard implements CanActivate {
//   constructor(private auth: AuthService) {}
//
//   canActivate(): Observable<boolean> {
//     console.log(this.auth.isAuthenticated())
//     return of(this.auth.isAuthenticated());
//   }
// }

const route = (path, component) => {
  // return {path, component, canActivate: [OperationsGuard]}
  return {path, component}
}

const routes: Routes = [
  // route('', OperationListComponent)
  // { path: '', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
  // { path: 'blueprints', component: BlueprintListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
