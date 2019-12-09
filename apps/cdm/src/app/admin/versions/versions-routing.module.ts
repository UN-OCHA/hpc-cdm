import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VersionsComponent } from './versions.component';
import { AdminGuard } from '@hpc/core';

const routes: Routes = [
  {
    path: '',
    component: VersionsComponent,
    children: [
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VersionsRoutingModule { }
