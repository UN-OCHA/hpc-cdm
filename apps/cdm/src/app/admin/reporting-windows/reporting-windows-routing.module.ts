import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

import { ReportingWindowStatesComponent } from './reporting-window-states/reporting-window-states.component';
import { ReportingWindowListComponent } from './reporting-window-list/reporting-window-list.component';
import { ReportingWindowFormComponent } from './reporting-window-form/reporting-window-form.component';
import { DataQueueComponent } from './data-queue/data-queue.component';
// import { RWindowDetailComponent } from './detail/detail.component';
// import { RWindowElementsComponent } from './elements/elements.component';
// import { RWindowWorkflowComponent } from './workflow/workflow.component';


@Injectable({providedIn: 'root'})
export class WindowGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): Observable<boolean> {
    // return of(this.auth.isAuthenticated() && this.auth.user && this.auth.user.isAdmin);
    return of(true);
  }
}

const route = (path, component, children=[]) => {
  const r: any = { path, component, canActivate: [WindowGuard] };
  if(children) {
    r.children = children;
  }
  return r;
}

const routes: Routes = [
  route('windows/:id/states', ReportingWindowStatesComponent),
  route('windows/:id/queue', DataQueueComponent),
  route('windows/:id', ReportingWindowFormComponent),
  route('windows', ReportingWindowListComponent),
  route('window', ReportingWindowFormComponent)
];
  //    [{path: '', redirectTo: 'detail', pathMatch: 'full'},
  //     {path: 'detail', component: RWindowDetailComponent} ]),
  // route('rwindows/:id/edit', RWindowFormComponent,
  //    [{path: '', redirectTo: 'detail', pathMatch: 'full' },
  //     {path: 'detail', component: RWindowDetailComponent},
  //     {path: 'elements', component: RWindowElementsComponent},
  //     {path: 'workflow', component: RWindowWorkflowComponent}]),
  // route('windows/:id/queue', DataQueueComponent)
    // canDeactivate: [PendingChangesGuard], ????????????


@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ReportingWindowsRoutingModule { }

// import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';
// import { PendingChangesGuard } from 'app/shared/services/auth/pendingChanges.guard.service';
