import {throwError as observableThrowError, from, Observable, defer } from 'rxjs';

import {catchError,  map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService,
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
        this.toastr.error('Please try again in a couple of moments', title);
        break;
      case 400:
        title = errorJson.error.message.details;
        this.toastr.error('We had an issue accessing one of our endpoints', title);
        break;
      case 401:
        if (errorJson.message === 'Client or key not accepted') {
          this.oauthService.logOut();
        }
        title = 'Login Required';
        this.toastr.error('You\'ll need to log in again to continue.', title);
        break;
      case 405:
        title = 'Endpoint doesn\'t exist';
        this.toastr.error('We had an issue accessing one of our endpoints', title);
        break;
      case 409:
        title = errorJson.error.message.details;
        this.toastr.error('We had an issue accessing one of our endpoints', title);
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

  public getPublicOperation (id: number, scopes?: Array<string>): Observable<any> {
    let params;
    if (scopes) {
      params = {scope: scopes.join(',')}
    }
    return this.getUrlWrapper(`v2/public/operation/${id}`, params)
  }

  public getGoverningEntitiesForOperation (id, getPublic = false): Observable<any> {
    return this.getUrlWrapper(`v2/${ getPublic ? 'public/' : '' }operation/${id}/governingEntities`);
  }

  public getCommentsForOperation (id): Observable<any> {
    return this.getUrlWrapper('v2/operation/' + id + '/comments');
  }

  public getPermittedActionsForOperation (id): Observable<any> {
    let params={
      operationId: id
    };
    console.log(params);
    return this.getUrlWrapper('v2/operationRole/permittedActions',{params});
  }

  public getOperation(id: number, operationVersionId = 'latest'): Observable<any> {
    let params={
      scopes: 'entityPrototypes,attachmentPrototypes,locations,emergencies,operationVersion,attachments'
    };
    return this.getUrlWrapper('v2/operation/' + id, {params});
  }

  public getOperationAttachments(id: any, operationVersionId = 'latest'): Observable<any> {
    let params={
      scopes: 'operationVersion,attachments'
    };
    return this.getUrlWrapper('v2/operation/' + id, {params});
  }

  public getOperationEntities(id: any, operationVersionId = 'latest'): Observable<any> {
    return this.getUrlWrapper(`v2/operation/${id}`, {});
  }

  public saveOperationAttachmentFile(file: any): Observable<any> {
    const fd = new FormData();
    fd.append('data', file);
    return this.postToEndpoint('v2/files/forms', {data: fd});
  }

  public saveOperationAttachment(attachment: any): Observable<any> {
    if (attachment.id) {
      return this.putToEndpoint('v2/operation/attachment/' + attachment.id, { data : {opAttachment: attachment}});
    } else {
      return this.postToEndpoint('v2/operation/attachment', { data : {opAttachment: attachment}});
    }
  }
  public deleteOperationAttachment(id: number): Observable<any> {

    const params = this.setParams();
    const headers = this.setHeaders();

    const url = environment.serviceBaseUrl + 'v2/operation/attachment/' + id;
    this.processStart(url, {}, '');
    return this.http.delete(url, { params, headers }).pipe(
      map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      }), catchError((error: any) => this.processError(error)));
  }
  public deleteOperationEntity(id: number): Observable<any> {

    const params = this.setParams();
    const headers = this.setHeaders();

    const url = environment.serviceBaseUrl + 'v2/operation/entityPrototype/' + id;
    this.processStart(url, {}, '');
    return this.http.delete(url, { params, headers }).pipe(
      map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      }), catchError((error: any) => this.processError(error)));
  }
  public deleteOperationPrototypeAttachment(id: number): Observable<any> {

    const params = this.setParams();
    const headers = this.setHeaders();

    const url = environment.serviceBaseUrl + 'v2/operation/attachmentPrototype/' + id;
    this.processStart(url, {}, '');
    return this.http.delete(url, { params, headers }).pipe(
      map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      }), catchError((error: any) => this.processError(error)));
  }

  public saveFormFile(file: any, name?: string): any {
    return new Promise(resolve => {
      const fd = new FormData();
      fd.append('data', file, name || file.name);
      this.postToEndpoint('v2/files/cdm', {data: fd}).subscribe(response => {
        resolve(response);
      });
    });
  }

  public getFormFile(file: any): Observable<any> {
    const url = this.buildUrl(`public/files/cdm/${file}`);
    return this.http.get(url, {});
  }

  // TODO: we have attachment files (files/forms),
  // form files (files/cdm -- api does not assign unique ids)
  // and we can also have other files (governing entity activation/deactivation letters);
  // should we have a different collection?
  // Using the same here but assigning unique names from the caller.
  public saveFile(file: any, name?: string): Observable<any> {
    const fd = new FormData();
    fd.append('data', file, name || file.name);
    return this.postToEndpoint('v2/files/cdm', {data: fd});
  }

  public getFile(fileUrl: any): Observable<any> {
    const url = this.buildUrl(fileUrl);
    return this.http.get(url, {});
  }

  public getFormFileUrl(filename: any) {
    return this.buildUrl(`/public/files/cdm/${filename}`);
  }

  public deleteOperationGve(id: number): Observable<any> {

    const params = this.setParams();
    const headers = this.setHeaders();

    const url = environment.serviceBaseUrl + 'v2/operation/governingEntity/' + id;
    this.processStart(url, {}, '');
    return this.http.delete(url, { params, headers }).pipe(
      map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      }), catchError((error: any) => this.processError(error)));
  }

  public getAttachmentPrototypes(id: number, operationVersionId = 'latest'): Observable<any> {
    // TODO update with actual endpoint
    return this.getUrlWrapper(`v2/operation/${id}/attachmentPrototype`);
  }

  public getAttachmentPrototype(id: number): Observable<any> {
    // TODO update with actual endpoint
    return this.getUrlWrapper(`v2/operation/attachmentPrototype/${id}`);
  }

  public saveAttachmentPrototype(data: any, id: number): Observable<any> {
     if (!id) {
      return this.postToEndpoint(`v2/operation/${data.operationId}/attachmentPrototype`, {
        data: {opAttachmentPrototype:data}
      });
    }
    return this.putToEndpoint('v2/operation/attachmentPrototype/' + id, {
      data: {opAttachmentPrototype:data}
    });
  }

  public getEntityPrototypes(id: number): Observable<any> {
    return this.getUrlWrapper(`v2/operation/${id}/entityPrototype`);
  }

  public getEntityPrototype(id: number): Observable<any> {
    // TODO update with actual endpoint
    return this.getUrlWrapper(`v2/operation/entityPrototype/${id}`);
  }

  public saveEntityPrototype(data: any, id: number): Observable<any> {
    if (!id) {
      return this.postToEndpoint(`v2/operation/${data.operationId}/entityPrototype`, {
        data: {opEntityPrototype:data}
      });
    }
    return this.putToEndpoint('v2/operation/entityPrototype/' + id, {
      data: {opEntityPrototype:data}
    });
  }

  public createOperation(operation): Observable<any> {
    return this.postToEndpoint('v2/operation', {
      data: { operation }
    });
  }

  public saveOperation(operation): Observable<any> {
    return this.putToEndpoint('v2/operation/' + operation.id, {
      data: {
        operation
      }
    });
  }

  public saveGoverningEntity(governingEntity): Observable<any> {
    if (!governingEntity.id) {
      return this.postToEndpoint('v2/operation/governingEntity', {
        data: { opGoverningEntity: governingEntity }
      });
    }
    return this.putToEndpoint('v2/operation/governingEntity/' + governingEntity.id, {
      data: {
        opGoverningEntity: governingEntity
      }
    });
  }

  public setOperationLocations (operation, locationIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/locations`, {
      data: {
        locationIds,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationEmergencies (operation, emergencyIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/emergencies`, {
      data: {
        emergencyIds,
        updatedAt: operation.updatedAt
      }
    });
  }

  public getGoverningEntity(id, scopes?): Observable<any> {
    let params = {};
    if (scopes) {
      params = {scopes: scopes.join(',')}
    }
    return this.getUrlWrapper(`v2/operation/governingEntity/${id}`, {params});
  }

  public getOperations(options?: any): Observable<any> {
    const params = _.cloneDeep(options);
    return this.getUrlWrapper('v2/operation', {params})
  }

  public getLocations(): Observable<any> {
    return this.getUrlWrapper('v2/location', {cache: true});
  }

  public autocompleteLocation(search: string, adminLevel?: number): Observable<any> {
    let url = `v1/location/autocomplete/${search}`;
    if (adminLevel) {
      url += '?adminLevel=' + adminLevel;
    }
    return this.fetchEndpoint(url).pipe(
      map((res: any) => res.data))
  }

  public getLocation(locationId, maxLevel?): Observable<any> {
    const params = {maxLevel: null};
    if (maxLevel) {
      params.maxLevel = maxLevel;
    }
    return this.getUrlWrapper('v2/location/' + locationId, {params, cache: true});
  }

  public getNestedLocation(id): Observable<any> {
    return this.getUrlWrapper(`v2/location/nested/${id}`, {cache: true});
  }

  public autocompleteEmergency(search: string): Observable<any> {
    return this.autocomplete('emergency', search);
  }

  private autocomplete(objectType: string, search: string): Observable<any> {
    return this.fetchEndpoint(`v1/object/autocomplete/${objectType}/${search}`).pipe(
      map((res: any) => res.data))
  }

  public getBlueprints(): Observable<any> {
    return this.getUrlWrapper('v2/blueprint');
  }

  public getBlueprint(id: any): Observable<any> {
    return this.getUrlWrapper(`v2/blueprint/${id}`);
  }

  public saveBlueprint(data: any, id: any): Observable<any> {
    if (!id) {
      return this.postToEndpoint('v2/blueprint', {
        data: {blueprint:data}
      });
    }
    return this.putToEndpoint('v2/blueprint/' + id, {
      data: {blueprint:data}
    });
  }

  public deleteBlueprint(blueprintId: any): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    const url = environment.serviceBaseUrl + 'v2/blueprint/' + blueprintId;
    this.processStart(url, {}, '');
    return this.http.delete(url, { params, headers }).pipe(
      map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      }), catchError((error: any) => this.processError(error)));
  }

  public getParticipantByHid(hid: string): Observable<any> {
    return this.getUrlWrapper('v2/participant/hidId/' + hid);
  }

  public getParticipantById(id: number): Observable<any> {
    return this.getUrlWrapper('v1/participant/' + id);
  }
  public getgoveningEntityById(id: number): Observable<any> {
    return this.getUrlWrapper('v2/governingEntity/' + id);
  }

  public getAllReportingWindows(): Observable<any> {
    return this.getUrlWrapper('v2/reportingWindow');
  }

  public getReportingWindow(id: number, reportingWindowVersionId = 'latest'): Observable<any> {
    let params={
      scopes: ''
    };
    return this.getUrlWrapper('v2/reportingWindow/' + id, {params});
  }
  public getReportingWindows(operationId: number): Observable<any> {
    // TODO use direct end point for single operation
    return this.getUrlWrapper('v2/reportingWindow');
  }

  public saveReportingWindow(xdata: any): Observable<any> {
    if (xdata.id) {
      return this.putToEndpoint(`v2/reportingWindow/${xdata.id}`, {
        data: {reportingWindow: xdata}});
    }
    return this.postToEndpoint('v2/reportingWindow', {
      data: {reportingWindow: xdata}});
  }

  public getReport(attachmentId, reportingWindowId): Observable<any> {
    // TODO fetch single report
    return from(new Promise(resolve => {
      this.getUrlWrapper('v2/dataReport').subscribe(reports => {
        const report = reports.filter(r => r.opAttachmentId === attachmentId
          && r.reportingWindowId === reportingWindowId);
        if(report.length > 0) {
          resolve(report[0]);
        }
        resolve(null);
      })
    }));
  }

  public saveReport(xdata: any): Observable<any> {
    if(xdata.id) {
      return this.putToEndpoint(`v2/dataReport/${xdata.id}`, {
        data: {dataReport: xdata}});
    } else {
      return this.postToEndpoint('v2/dataReport', {
        data: {dataReport: xdata}});
    }
  }

  public getParticipantRoles(): Observable<Array<any>> {
    const claims = this.oauthService.getIdentityClaims();
    if (claims) {
      return this.getUrlWrapper('v1/participant/hidId/' + claims['user_id'])
        .pipe(map(participant => {
          return participant['roles'];
        }));
    } else {
      return observableThrowError('No one is logged in.');
    }
  }

  public getDataEntries(reportingWindowId: any): Observable<any> {
    //TODO use actual endpoint
    return defer(() => new Promise(resolve => {
      resolve([1,2,3,4,5]);
    }));
  }

  public getDataVersions(entry: any): Observable<any> {
    //TODO use actual endpoint
    return defer(() => new Promise(resolve => {
      resolve([1,2,3,4,5]);
    }));
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
