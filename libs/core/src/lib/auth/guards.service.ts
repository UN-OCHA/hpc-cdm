import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { ApiService } from '../api/api.service';
import {mergeMap, map, catchError} from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';


@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private apiService: ApiService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as Array<string>;

    return this.authService.isAuthenticated(route).pipe(
      mergeMap((isAuthenticated) => {
         if (!isAuthenticated) {
          this.oauthService.initImplicitFlow(state.url);
          return [false];
        }
        if (isAuthenticated && requiredRoles && requiredRoles.length) {
          return this.participantHasAccess(requiredRoles);
        }
        return of(isAuthenticated);
      }), catchError(() => {
        return of(false);
      }));
  }

  public participantHasAccess(requiredRoles: Array<string>): Observable<boolean> {
    const res = this.apiService.getParticipantRoles().pipe(
      map(userRoles => {
        const userRoleNames = _.map(userRoles, 'name');
        if (_.intersection(userRoleNames, requiredRoles).length) {
          return true;
        } else {
          this.toastr.error('cannot grant this role with this user', 'Access Denied Trying to Connect to Administrative!!');
          return false;
        }
      }));
      console.log(res);
      return res;
  }
}
// export class AdminGuard implements CanActivate {
//   constructor(
//     private auth: AuthService,
//     private router: Router) {}

//   canActivate(): Observable<boolean> {
//     if(this.auth.isAuthenticated() && this.auth.user && this.auth.user.isAdmin) {
//       return of(true);
//     }
//     this.router.navigate(['']);
//     return of(false);
//   }
// }

@Injectable({providedIn: 'root'})
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) {}
z
  canActivate(): Observable<boolean> {
    if(this.auth.isLogin()) {
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
    if(!this.auth.isLogin()) {
      return of(true);
    }
    this.router.navigate(['/dashboard']);
    return of(false);
  }
}
