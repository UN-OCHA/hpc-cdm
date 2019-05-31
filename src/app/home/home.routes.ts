import { ModuleWithProviders } from '@angular/core';
import {RouterModule} from '@angular/router';
import {HomeComponent} from './home.component';

const routes = [
  {path: '', component: HomeComponent}
];

export const homeRoutes: ModuleWithProviders = RouterModule.forChild(routes);
