import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './shared/components/shell/home/home.component';
import { LogoutComponent } from './shared/components/shell/logout/logout.component';
//import { AuthGuard } from './shared/services/auth/auth.guard.service';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'Home' }},
  { path: 'logout', component: LogoutComponent, data: { title: 'Logout' }},

  { path: '**', redirectTo: '' }
];

export const appRoutingProviders: any[] = [];

// see https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
// about the onSameUrlNavigation: 'reload' bit
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
  onSameUrlNavigation: 'reload',
  paramsInheritanceStrategy: 'always'
});
