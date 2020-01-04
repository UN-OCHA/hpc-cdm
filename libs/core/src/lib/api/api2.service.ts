import {throwError as observableThrowError, from, Observable, defer } from 'rxjs';

import {catchError,  map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

// import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';

import { environment } from '../environments/environment';

@Injectable({providedIn: 'root'})
export class ApiService {

  public apiUp = true;
  public inProgress = 0;
  public token = null;
  // We keep track of when the user was last authenticated.

  private baseUrl = environment.serviceBaseUrl;

  private cache$: Array<any> = [];

  constructor (
    private http: HttpClient,
    // private toastr: ToastrService,
    private oauthService: OAuthService,
  ) {}

  //////////////////////////////////////////////

  // api error catcher for program control
  public processError(error: any): Observable<any> {
    let title = '';
    this.apiUp = true;
    let errorJson: any;
    if (error && error.json) {
      errorJson = error.json();
    } else {
      errorJson = error;
    }

    switch (error.status) {
      case 0:
        title = 'Failed to reach HPC API';
        this.apiUp = false;
        // this.toastr.error('Please try again in a couple of moments', title);
        break;
      case 401:
        if (errorJson.message === 'Client or key not accepted') {
          this.oauthService.logOut();
        }
        title = 'Login Required';
        // this.toastr.error('You\'ll need to log in again to continue.', title);
        break;
      case 405:
        title = 'Endpoint doesn\'t exist';
        // this.toastr.error('We had an issue accessing one of our endpoints', title);
        break;
      case 500:
        this.displayMessage(errorJson);
        break;
      default:
        this.displayMessage(errorJson);
        break;
    }

    console.error(title, error);

    this.inProgress -= 1;
    return observableThrowError(error);
  }

  private displayMessage(errorJson: any) {
    if (errorJson && errorJson.error && errorJson.error.message) {
      let message = JSON.stringify(errorJson.error.message);
      let details = errorJson.error.details;
      if (errorJson.error.message.message) {
        message = errorJson.error.message.message;
        details = errorJson.error.message.details;
      }

      if (typeof details === 'string') {
        // this.toastr.error(details, message);
      } else {
        // this.toastr.error(message, errorJson.code);
      }
    } else if (errorJson) {
      // this.toastr.error(errorJson.message, errorJson.code);
    }
  }

  // api success catcher for program control
  processSuccess(url: string, res: HttpResponse<any>): any {
    this.apiUp = true;
    this.inProgress -= 1;
    return res;
  }

  // api call start stuff for program control
  processStart(url: string, payload: any, method: string ): any {
    this.apiUp = true;
    this.inProgress += 1;
  }


  /****
   *
   * Endpoints
   *
   ****/

  private buildUrl(endpoint: string): string {
    return this.baseUrl + endpoint;
  }

  private dataToEndpoint(httpCommand: string, endpoint: string, options?: any): Observable<any> {
    const tryUrl = this.buildUrl(endpoint);

    const data = (options && options.data) || {};

    let params = this.setParams();
    const headers = this.setHeaders();

    if (options && options.scope) {
      params = params.set('scope', options.scope);
    }

    this.processStart(tryUrl, data, '');

    return this.http[httpCommand](tryUrl, data, {params, headers})
      .pipe(map((res: HttpResponse<any>) => this.processSuccess(tryUrl, res)))
      .pipe(map((res: any) => res.data || res))
      .pipe(catchError((error: any) => this.processError(error)));
  }

  private postToEndpoint(endpoint: string, options?: any): Observable<any> {
    return this.dataToEndpoint('post', endpoint, options);
  }

  private putToEndpoint(endpoint: string, options?: any): Observable<any> {
    return this.dataToEndpoint('put', endpoint, options);
  }

  private fetchEndpoint(endpoint: string, options?: any): Observable<any> {
    const tryUrl = this.buildUrl(endpoint);

    let params = this.setParams();
    const headers = this.setHeaders();
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

    this.processStart(tryUrl, {}, '');

    return this.http.get(tryUrl, {params, headers})
      .pipe(map((res: HttpResponse<any>) => this.processSuccess(tryUrl, res))).pipe(
      catchError((error: any) => this.processError(error)));
  }

  private getUrlWrapper (url, options?) {
    if (options && options.cache) {
      let urlAndParams = url;
      if (options.params) {
        urlAndParams += '?' + (Object.keys(options.params)
                                      .map((key) => `${key}=${encodeURIComponent(options.params[key])}`)
                                      .join('&'));
      }

      let cachedObservable = _.find(this.cache$, ['key', urlAndParams]);

      if (!cachedObservable || (cachedObservable && cachedObservable.date.isBefore(moment().subtract(1, 'm')))) {
        cachedObservable = {
          key: urlAndParams,
          obs: this.fetchEndpoint(url, options)
            .pipe(map(data => {
              return data.data;
            }))
            .pipe(shareReplay(1)),
          date: moment()
        }
        _.remove(this.cache$, ['key', urlAndParams]);

        this.cache$.push(cachedObservable);
      }
      return cachedObservable.obs;
    } else {
      return this.fetchEndpoint(url, options).pipe(
        map(data => {
          return data.data;
        }));
    }
  }





  public getOperation(id: number, operationVersionId = 'latest'): Observable<any> {
    let params={
      scopes: 'entityPrototypes,attachmentPrototypes,locations,emergencies,operationVersion,attachments'
    };
    return this.getUrlWrapper('v2/operation/' + id, {params});
  }


  public getOperations(options?: any): Observable<any> {
    const params = _.cloneDeep(options);
    return this.getUrlWrapper('v2/operation', {params})
  }


  public setParams(options?: any): HttpParams {
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

  public setHeaders(options?: any): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders();

    if (this.oauthService.getAccessToken()) {
      headers = headers.append('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
      headers = headers.append('Accept', 'application/json');
    }

    return headers;
  }
}
