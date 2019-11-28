import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@hpc/core';

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) {}

  canActivate(): Observable<boolean> {
    if(this.auth.isAuthenticated() && this.auth.user && this.auth.user.isAdmin) {
      return of(true);
    }
    this.router.navigate(['']);
    return of(false);
  }
}

export const operationAdminRoute = (path, component) => {
  path = `operations/:operationId/${path}`;
  return adminRoute(path, component);
};

export const adminRoute = (path, component) => {
  return { path, component, canActivate: [AdminGuard] };
};
