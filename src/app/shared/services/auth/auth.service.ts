
import { Injectable } from '@angular/core';
import { HttpResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of ,  ReplaySubject } from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import { OAuthService } from 'angular-oauth2-oidc';

import { ApiService } from '../api/api.service';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {

  public verifiedUser;
  private _updatedVerifiedUser = new ReplaySubject<any>();
  private _updatedParticipant = new ReplaySubject<any>();
  public verifiedUserUpdated$ = this._updatedVerifiedUser.asObservable();
  public participantUpdated$ = this._updatedParticipant.asObservable();
  public participant;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  public rolesCheck(): void {
    this.fetchParticipant()
      .subscribe(({user}) => {
        this.participant = user;
        this._updatedParticipant.next(this.participant);
        let isAdmin = false;
        if (user) {
          for (const role of user.roles) {
            if (role.name === 'hpcadmin' || role.name === 'prismadmin' || role.name === 'rpmadmin') {
              isAdmin = true;
            }
          }

          if (!isAdmin && !user.organizations.length && !user.locations.length) {
            this.router.navigate(['/user/profile']);
          }
        } else {
          this.router.navigate(['/user/profile']);
        }
      });
  }

  public isAuthenticated(route: ActivatedRouteSnapshot): Observable<boolean> {
    const url = environment.authBaseUrl + 'account.json';
    let headers = new HttpHeaders();

    this.apiService.processStart(url, {}, '');

    headers = headers.append('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    headers = headers.append('Accept', 'application/json');

    return this.http.get(url, {headers}).pipe(
      map((res: HttpResponse<any>) => this.apiService.processSuccess(url, res)),
      map(res => {
        if (res.email) {
          // This avoids an infinite loop caused by canActivate
          if (!(route.routeConfig.path === 'user/profile')) {
            this.verifyUserProfile(res.email);
          }
          return true;
        } else {
          this.verifiedUser = false;
          this._updatedVerifiedUser.next(this.verifiedUser);
          return false;
        }
      }),
      catchError(() => {
        this.verifiedUser = false;
        this._updatedVerifiedUser.next(this.verifiedUser);
        return of(false);
      }));
  }

  public verifyUserProfile (email?: string): void {
    // If the claims exist we don't have to load the user profile.
    const claims = this.oauthService.getIdentityClaims();
    if (this.oauthService.hasValidAccessToken() && claims && (!email || email === claims['email'])) {
      this.verifiedUser = claims;
      this._updatedVerifiedUser.next(this.verifiedUser);
      this.rolesCheck();
    } else {
      this.oauthService.loadUserProfile()
        .then(up => {
          this.verifiedUser = up;
          this._updatedVerifiedUser.next(this.verifiedUser);
          this.rolesCheck();
        });
    }
  }

  public fetchParticipant (): Observable<any> {
    const claims = this.oauthService.getIdentityClaims();

    if (!this.participant) {
      return this.apiService.getParticipantByHid(claims['user_id']).pipe(
        map(user => {
          return {
            user,
            claims
          }
        }))
    } else {
      return of({
        user: this.participant,
        claims
      });
    }
  }
}
