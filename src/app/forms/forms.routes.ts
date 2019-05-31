import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsComponent } from './forms.component';

const routes: Routes = [
  { path: '', component: FormsComponent }
];

export const formsRoutes: ModuleWithProviders = RouterModule.forChild(routes);
