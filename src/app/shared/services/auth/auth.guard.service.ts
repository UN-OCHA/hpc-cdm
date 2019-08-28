
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';

import { Observable, of } from 'rxjs';
import {mergeMap, map, catchError} from 'rxjs/operators';

import * as _ from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private oauthService: OAuthService,
    private apiService: ApiService,
    private authService: AuthService
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
    return this.apiService.getParticipantRoles().pipe(
      map(userRoles => {
        const userRoleNames = _.map(userRoles, 'name');
        if (_.intersection(userRoleNames, requiredRoles).length) {
          return true;
        } else {
          return false;
        }
      }));
  }
}
