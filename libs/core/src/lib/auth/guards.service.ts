import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';


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

@Injectable({providedIn: 'root'})
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) {}

  canActivate(): Observable<boolean> {
    if(this.auth.isAuthenticated()) {
      return of(true);
    }
    this.router.navigate(['']);
    return of(false);
  }
}

@Injectable({providedIn: 'root'})
export class NotAuthenticatedGuard implements CanActivate {
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
