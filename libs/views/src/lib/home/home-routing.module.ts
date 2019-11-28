import { Injectable, NgModule } from '@angular/core';
import { Router, CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '@hpc/core';

@Injectable({providedIn: 'root'})
export class HomeAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) {}

  canActivate(): Observable<boolean> {
    if(!this.auth.isAuthenticated()) {
      return of(true);
    }
    this.router.navigate(['/dashboard']);
    return of(false);
  }
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    canActivate: [HomeAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class HomeRoutingModule { }
