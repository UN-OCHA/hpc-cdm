import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { NotAuthenticatedGuard } from '@hpc/core';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    canActivate: [NotAuthenticatedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
