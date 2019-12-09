import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticatedGuard } from '@hpc/core';

import { XFormsComponent } from './xforms.component';

const routes: Routes = [
  {path: ':id', component: XFormsComponent, canActivate: [AuthenticatedGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XFormsRoutingModule {  
}
