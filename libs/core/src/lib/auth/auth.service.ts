import { Injectable } from '@angular/core';
import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, pipe, throwError, ReplaySubject } from 'rxjs';
import { filter, map, retry, take, catchError } from 'rxjs/operators';
import { User, buildUser } from '@hpc/data';
import { authConfig } from './auth.config';
import { environment } from '../environments/environment';
import { ApiService } from '../api/api.service';


const authHeaders = (token: string): HttpHeaders => {
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  });
}

@Injectable({providedIn: 'root'})
export class AuthService {
  public verifiedUser;
  readonly _user = new BehaviorSubject<User>(null);
  readonly user$ = this._user.asObservable();
  private _updatedVerifiedUser = new ReplaySubject<any>();

  constructor(
    private api: ApiService,
    private oauth: OAuthService,
    private http: HttpClient){}

  get user(): User { return this._user.getValue(); }
  set user(val: User) { this._user.next(val); }

  tryLogin(): void {
    this.oauth.configure(authConfig);
    this.oauth.tokenValidationHandler = new JwksValidationHandler();
    this.oauth.setStorage(localStorage);
    this.oauth.tryLogin({});

    this.oauth.events
      .pipe(filter(e => e.type === 'session_terminated'))
      .subscribe(e => {
        console.log(e, 'Your session has been terminated!');
      });

    this.oauth.events.pipe(filter(e => e.type === 'token_received'))
      .subscribe(e => {
        console.log(e, 'Load profile');
        this.oauth.loadUserProfile();
      });
  }

  initImplicitFlow() {
    this.oauth.initImplicitFlow();
  }

  logout() {
    this.user = null;
    this.oauth.logOut();
    window.location.href = this.oauth.logoutUrl;
  }

  // isAuthenticated(route: ActivatedRouteSnapshot): Observable<boolean> {
  isLogin(): boolean {
    const url = `${environment.authBaseUrl}account.json`;
    const token = this.oauth.getAccessToken();
    if(token) {
      const http$ = this.http.get(url, {headers: authHeaders(token)})
        http$
        // .pipe(
        //   catchError(err => {
        //     console.log(err);
        //     return false;
        //   )
        // )
        .subscribe(
          res => this._handleUser(res),
          err => this._handleError(err)
        );
      return true;
    } else {
      console.log('3333333333333333333333333333333333')
      this.user = null;
      return false;
    }
  }
  public isAuthenticated(route: ActivatedRouteSnapshot): Observable<boolean> {
    const url = environment.authBaseUrl + 'account.json';
    let headers = new HttpHeaders();

    this.api.processStart(url, {}, '');

    headers = headers.append('Authorization', 'Bearer ' + this.oauth.getAccessToken());
    headers = headers.append('Accept', 'application/json');

    return this.http.get(url, {headers}).pipe(
      map((res: HttpResponse<any>) => this.api.processSuccess(url, res)),
      map(res => {
        if (res.email) {
          if (!(route.routeConfig.path === 'user/profile')) {
            this._verifyUserProfile(res.email);
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

  _handleUser(response: any): boolean {
    if(response.email && response.email_verified) {
      this._verifyUserProfile(response.email);
      return true;
    }
    this.user = null;
    return false;
  }

  _handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknow error';
    if(error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error code: ${error.status}\nMessage: ${error.message}`;
    }
  }

  _verifyUserProfile (email: string): void {
    // If the claims exist we don't have to load the user profile.
    const claims: any = this.oauth.getIdentityClaims();
    if (this._validEmailClaim(email, claims)) {
      this._fetchParticipant(claims);
    } else {
      this.oauth.loadUserProfile().then((up: any) => {
        this._fetchParticipant(up);
      });
    }
  }

  _validEmailClaim(email, claims) {
    return claims && (!email || email === claims.email);
  }

  _fetchParticipant (response: any): void {
    // this.api.getParticipantByHid(userId).subscribe(response => {
    this.user = buildUser(response);
    // TODO this should come from the api above;
    this.user.isAdmin = true;//response.is_admin;
  }
}
