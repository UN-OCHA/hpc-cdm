import { NgModule, Injectable } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService, AdminGuard } from '@hpc/core';
import { ReportsComponent } from './reports.component';
import { ReportListComponent } from './report-list/report-list.component';
import { EntitiesComponent } from './entities/entities.component';


const routes: Routes = [
  {
    path: '', component: ReportsComponent, canActivate: [AdminGuard],
    children: [
      { path: '', component: ReportListComponent },
      { path: ':entityId', component: EntitiesComponent },      
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
