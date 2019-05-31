import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubmissionsComponent } from './submissions.component';

const routes = [
  { path: '', component: SubmissionsComponent }
];

export const submissionsRoutes: ModuleWithProviders = RouterModule.forChild(routes);
