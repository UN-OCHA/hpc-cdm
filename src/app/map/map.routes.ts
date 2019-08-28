import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';

import { MapWrapperComponent } from './components/map-wrapper/map-wrapper.component';


const mapRoutes: Routes = [
  { path: 'map',
    component: MapWrapperComponent,
    canActivate: [AuthGuard],
    data: { title: 'Map' } },
];

export const mapRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(mapRoutes);
