import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';

import { MapWrapperComponent } from './components/map-wrapper/map-wrapper.component';
import { OperationsComponent } from './components/operations/operations.component';


const route = (path, component, title) => {
  return { path, component, canActivate: [AuthGuard], data: { title } };
};

const mapRoutes: Routes = [
  route('map', MapWrapperComponent, 'Map'),
  route('operations', OperationsComponent, 'Operations')
];

export const mapRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(mapRoutes);
