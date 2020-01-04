// import {throwError as observableThrowError, from, Observable, defer } from 'rxjs';

// import {catchError,  map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { processStart, processSuccess, processError} from './process.service';

// import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';

import { environment } from '../environments/environment';

@Injectable({providedIn: 'root'})
export class FetchService {

  constructor(
    private http: HttpClient,
    // private toastr: ToastrService,
    private oauthService: OAuthService,
  ){}

  fetch(url, options?) {
    return this.fetchEndpoint(url, options)
    .pipe(map(data => { return data.data; }));
  }

  private fetchEndpoint(endpoint: string, options?: any): Observable<any> {
    const tryUrl =  `${environment.serviceBaseUrl}${endpoint}`;

    let params = this._params();
    const headers = this._headers();
    if (options && options.scope) {
      params = params.set('scope', options.scope);
    }

    if (options && options.params) {
      Object.keys(options.params).forEach(key => {
        if (typeof options.params[key] === 'object' &&
          !Array.isArray(options.params[key])) {
          params = params.set(key, JSON.stringify(options.params[key]));
        } else {
          params = params.set(key, options.params[key]);
        }
      })
    }

    processStart(tryUrl, {}, '');

    return this.http.get(tryUrl, {params, headers})
      .pipe(map((res: HttpResponse<any>) => processSuccess(tryUrl, res)))
      .pipe(catchError((error: any) => processError(error)));
  }

  private _params(options?: any): HttpParams {
    let params: HttpParams = new HttpParams();

    if (this.oauthService.getAccessToken()) {
      const claims = this.oauthService.getIdentityClaims();
      if (claims) {
        params = params.set('userid', claims['user_id']);
      }
    }

    if (options && options.params) {
      Object.keys(options.params).forEach(key => {
        params = params.set(key, options.params[key]);
      })
    }

    return params;
  }

  private _headers(options?: any): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders();

    if (this.oauthService.getAccessToken()) {
      headers = headers.append('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
      headers = headers.append('Accept', 'application/json');
    }

    return headers;
  }
