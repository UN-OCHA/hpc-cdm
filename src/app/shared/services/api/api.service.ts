
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError,  map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';

import { environment } from 'environments/environment';

@Injectable()
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
        this.toastr.error(details, message);
      } else {
        this.toastr.error(message, errorJson.code);
      }
    } else if (errorJson) {
      this.toastr.error(errorJson.message, errorJson.code);
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
      .pipe(map((res: any) => res.data))
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

  public getGlobalClustersforOperation (id, getPublic = false): Observable<any> {
    return this.getUrlWrapper(`v2/${ getPublic ? 'public/' : '' }operation/${id}/globalClusters`);
  }

  public getFulfillmentsForOperation (id, getPublic = false): Observable<any> {
    return this.getUrlWrapper(`v2/${ getPublic ? 'public/' : ''}operation/${id}/fulfillments`);
  }

  public getOperationPlans (id, getPublic = false): Observable<any> {
    return this.getUrlWrapper(`v2/${ getPublic ? 'public/' : ''}operation/${id}/plans`);
  }

  public getSegmentsForOperation (id): Observable<any> {
    return this.getUrlWrapper('v2/public/operation/' + id + '/segments');
  }

  public getOperationFieldsForOperation (id): Observable<any> {
    return this.getUrlWrapper('v2/public/operation/' + id + '/fields');
  }

  public getWorkflowStatusForOperation (id): Observable<any> {
    return this.getUrlWrapper('v2/operation/' + id + '/statuses');
  }

  public getCommentsForOperation (id): Observable<any> {
    return this.getUrlWrapper('v2/operation/' + id + '/comments');
  }

  public getOperation(id: number, operationVersionId = 'latest'): Observable<any> {
    let params={
      scopes: 'entityPrototypes,attachmentPrototypes,locations,emergencies,operationVersion,attachments'
    };
    return this.getUrlWrapper('v2/operation/' + id, {params});
  }

  public getOperationAttachments(id: number): Observable<any> {
    // TODO update with actual endpoint
    return this.getUrlWrapper('v1/plan/830/attachment-prototype');
  }

  public saveOperationAttachment(attachment: any, id: number): Observable<any> {
    // TODO update with actual endpoint
    console.log('saving operation attachment');
    console.log(id);
    console.log(attachment);
    if(id) {
      //update
    } else {
      //create
    }
    return null;
  }

  public deleteOperationAttachment(id: number): Observable<any> {
    // TODO update with actual endpoint
    return null;
  }

  public saveOperationGve(gve: any, id: number): Observable<any> {
    // TODO update with actual endpoint
    console.log('saving operation gve');
    console.log(id);
    console.log(gve);
    if(id) {
      //update
    } else {
      //create
    }
    return null;
  }

  public deleteOperationGve(id: number): Observable<any> {
    // TODO update with actual endpoint
    return null;
  }

  public saveGveAttachment(attachment: any, id: number): Observable<any> {
    // TODO update with actual endpoint
    console.log('saving gve attachment');
    console.log(id);
    console.log(attachment);
    if(id) {
      //update
    } else {
      //create
    }
    return null;
  }

  public deleteGveAttachment(id: number): Observable<any> {
    // TODO update with actual endpoint
    return null;
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
      return this.postToEndpoint('v2/operation/attachmentPrototype', {
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
      return this.postToEndpoint('v2/operation/entityPrototype', {
        data: {opEntityPrototype:data}
      });
    }
    return this.putToEndpoint('v2/operation/entityPrototype/' + id, {
      data: {opEntityPrototype:data}
    });
  }

  public getOperationVersion(id: number): Observable<any> {
    return this.getUrlWrapper('v2/operationVersion/' + id);
  }

  public getProcedureStepsForVersions (planId, operationVersionIds): Observable<any> {
    return this.getUrlWrapper(`v2/planProcedure/${planId}/operationVersionSteps`, {
      params: {
        operationVersionIds
      }
    })
  }

  public getPossibleActionsForOperations (ids: Array<number>): Observable<boolean> {
    return this.getUrlWrapper('v2/operation/possibleActions', {
      params: {
        ids: ids.join(',')
      }
    });
  }

  public publishLastVersion(id: number): Observable<any> {
    return this.putToEndpoint(`v2/operation/${id}/publish`)
  }

  public unPublishLastVersion(id: number): Observable<any> {
    return this.putToEndpoint(`v2/operation/${id}/unpublish`)
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
        governingEntity
      }
    });
  }

  public duplicateOperation(operationId): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operationId}/duplicateVersion`, {});
  }

  public setOperationContacts (operation, contacts): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/contacts`, {
      data: {
        contacts,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationOrganizations (operation, organizationIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/organizations`, {
      data: {
        organizationIds,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationFields (operation, fields): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/fields`, {
      data: {
        fields,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationPlans (operation, planIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/plans`, {
      data: {
        planIds,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationGoverningEntities (operation, governingEntityIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/governingEntities`, {
      data: {
        governingEntityIds,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationPlanEntities (operation, planEntityIds): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/planEntities`, {
      data: {
        planEntityIds,
        updatedAt: operation.updatedAt
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

  public setOperationAttachments (operation, operationAttachments): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/attachments`, {
      data: {
        operationVersionId: operation.operationVersion.id,
        operationVersionAttachments: operationAttachments,
        updatedAt: operation.updatedAt
      }
    })
  }

  public setOperationSegments (operation, segments: Array<any>): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/segments`, {
      data: {
        operationVersionId: operation.operationVersion.id,
        segments,
        updatedAt: operation.updatedAt
      }
    });
  }

  public setOperationComments (operation, comments: Array<any>): Observable<any> {
    return this.putToEndpoint(`v2/operation/${operation.id}/comments`, {
      data: {
        comments,
        updatedAt: operation.updatedAt
      }
    });
  }
  public searchByEmail(email) {
    const params = this.setParams();
    const headers = this.setHeaders();
    const url = environment.serviceBaseUrl + 'v2/participant/searchByEmail'
    this.processStart(url, {}, '');
    return this.http.post(url, { email: email }, { params, headers })
      .pipe(map((res: HttpResponse<any>) => {
        this.processSuccess(url, res);
        return res;
      })).pipe(catchError((error: any) => this.processError(error)));
  }

  public saveParticipant(participant): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.id) {
      const url = environment.serviceBaseUrl + 'v1/participant/' + participant.id
      this.processStart(url, {}, '');
      return this.http.put(url, {participant: participant}, {params, headers})
        .pipe(map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        })).pipe(catchError((error: any) => this.processError(error)));
    } else {
      const url = environment.serviceBaseUrl + 'v1/participant';
      this.processStart(url, {}, '');
      return this.http.post(environment.serviceBaseUrl + 'v1/participant', {participant: participant}, {params, headers}).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public saveParticipantOrganization(participant, organization): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.organizations[0]) {
      const participantOrganizationId = participant.organizations[0].participantOrganization.id
      const url = environment.serviceBaseUrl + 'v2/participantOrganization/' + participantOrganizationId;
      this.processStart(url, {}, '');
      return this.http.put(url, {
        participantOrganization: {
          participantId: participant.id,
          organizationId: organization.id
        }
      }, {params, headers}).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    } else {
      const url = environment.serviceBaseUrl + 'v2/participantOrganization';
      this.processStart(url, {}, '');
      return this.http.post(url, {
        participantOrganization: {
          participantId: participant.id,
          organizationId: organization.id
        }
      }, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public updateParticipantOrganization(participantOrganization): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participantOrganization.participantId) {
      const url = `${environment.serviceBaseUrl}/v2/participantOrganization/${participantOrganization.id}`;
      this.processStart(url, {}, '');
      return this.http.put(url, {
        participantOrganization: participantOrganization
      }, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public saveParticipantCountry(participant, country): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.id) {
      const url = environment.serviceBaseUrl + 'v2/participantCountry';
      this.processStart(url, {}, '');
      return this.http.post(url, {
        participantCountry: {
          participantId: participant.id,
          locationId: country.id
        }
      }, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }
  public saveParticipantRole(participantRole): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participantRole.participantId) {
      const url = environment.serviceBaseUrl + 'v2/participantRole';
      this.processStart(url, {}, '');
      return this.http.post(url, {
        participantRole: participantRole
      }, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }
  public updateParticipantCountry(participantCountry): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participantCountry.participantId) {
      const url = `${environment.serviceBaseUrl}/v2/participantCountry/${participantCountry.id}`;
      this.processStart(url, {}, '');
      return this.http.put(url, {
        participantCountry: participantCountry
      }, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public deleteParticipantCountry(participant, country): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.id) {
      const url = environment.serviceBaseUrl + 'v2/participantCountry/' + country;
      this.processStart(url, {}, '');
      return this.http.delete(url, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public deleteParticipantOrganization(participant, organization): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.id) {
      const url = environment.serviceBaseUrl + 'v2/participantOrganization/' + organization;
      this.processStart(url, {}, '');
      return this.http.delete(url, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public deleteParticipantRole(participant, role): Observable<any> {
    const params = this.setParams();
    const headers = this.setHeaders();

    if (participant.id) {
      const url = environment.serviceBaseUrl + 'v2/participantRole/' + role;
      this.processStart(url, {}, '');
      return this.http.delete(url, { params, headers }).pipe(
        map((res: HttpResponse<any>) => {
          this.processSuccess(url, res);
          return res;
        }), catchError((error: any) => this.processError(error)));
    }
  }

  public getGlobalClusters(): Observable<any> {
    return this.getUrlWrapper('v1/global-cluster');
  }

  public getGlobalClustersByPlan(planId): Observable<any> {
    let params;
    if (planId) {
      params = { planId: planId }
    }
    return this.getUrlWrapper('v2/governingEntity', { params });
  }

  public getGoverningEntity(id, scopes?): Observable<any> {
    let params;
    if (scopes) {
      params = {scope: scopes.join(',')}
    }
    return this.getUrlWrapper('v2/governingEntity/' + id, {params});
  }

  public getPlan(id, scopes: string | boolean = 'procedure,attachments,planVersion,locations', isPublic = false): Observable<any> {
    let url = 'v2/plan/' + id;
    if (isPublic) {
      url =  `v2/public/plan/${id}?content=attachments`;
    } else {
      if (scopes) {
        if (scopes === true) {// handle legacy calls
          scopes = 'procedure,attachments,planVersion';
        }
        url += `?scopes=${scopes}`;
      }
    }
    return this.getUrlWrapper(url, {cache: true});
  }

  public getGroupedOperations(params: {
    planId?,
    groupBy?
    filterByStatus?
    filterByConditionField?,
    year?
  }): Observable<any> {
    const options = { params, cache: true };

    if (params.filterByStatus) {
      options.params['filterByStatus'] = params.filterByStatus
    }

    return this.getUrlWrapper(`v2/operation/requirements`, options)
  }

  public getPlanOperationsByGroup(id, {
    groupBy,
    groupId,
    filterByStatus,
    filterByConditionField
    }: {
      groupBy?,
      filterByStatus?,
      groupId?,
      filterByConditionField?
    }): Observable<any> {
    const options = {
      params: {
        groupBy,
        groupId,
        filterByStatus,
        filterByConditionField
      }
    }

    return this.getUrlWrapper(`v2/plan/${id}/operations`, options).shareReplay()
  }

  private reportWrapper (url, statusOptions = null) {
    const options = {
      params: {
        statusOptions
      }
    }

    return this.getUrlWrapper(url, options)
  }

  public getOperationPDFs (ids: Array<number>, forceRegeneration = false): Observable<any> {
    return this.getUrlWrapper(`v2/operation/pdfDownload?forceRegeneration=${forceRegeneration}&ids=${ids.join(',')}`);
  }

  public getOperationExports (planId): Observable<any> {
    return this.getUrlWrapper(`v2/operation/export?planId=${planId}`);
  }

  public getOperationVersionLocationsByPlan (searchOptions): Observable<any> {
    const planId = searchOptions.planIds[0];
    return this.getUrlWrapper(`v2/operation/locationsByPlan/${planId}?` +
      `workflowStatusOptionIds=${searchOptions.workflowStatusOptionIds.join(',')}` +
      `&governingEntityIds=${searchOptions.governingEntityIds.join(',')}`
    );
  }

  public getEntityInformationByIds(entityType: string, ids: Array<number>, planId?: number): Observable<any> {
    return this.getUrlWrapper(`v2/public/${entityType}?ids=${ids.join(',')}&planId=${planId ? planId : ''}&scopes=prototype`)
  }

  public getPlanIndicatorOverview(id, statusOptions = null): Observable<any> {
    return this.reportWrapper(`v2/plan/${id}/reports?reportType=overview&entityType=planEntity&attachmentType=indicator`, statusOptions)
  }

  public getPlanIndicatorTargetList(id, statusOptions = null): Observable<any> {
    return this.reportWrapper(`v2/plan/${id}/reports?reportType=detail&entityType=planEntity&attachmentType=indicator`, statusOptions)
  }

  public getPlanCaseloadsOverview(id, statusOptions = null): Observable<any> {
    return this.getUrlWrapper(`v2/plan/${id}/reports?reportType=overview&entityType=governingEntity&attachmentType=caseload`, statusOptions)
  }

  public getPlanCaseloadsDetail(id, statusOptions = null): Observable<any> {
    return this.getUrlWrapper(`v2/plan/${id}/reports?reportType=detail&entityType=governingEntity&attachmentType=caseload`, statusOptions)
  }

  public getProcedureByPlanId(planId, getPublic = false): Observable<any> {
    return this.getUrlWrapper(`v2/${ getPublic ? 'public/' : '' }plan/${planId}/procedure`, {cache: true});
  }

  public getProcedureSteps(planId, operationId): Observable<any> {
    return this.getUrlWrapper('v2/planProcedure/' + planId + '/steps', {params: {operationId}});
  }

  public getWorkflowStatusOptionById(workflowStatusOptionId): Observable<any> {
    return this.getUrlWrapper(`v2/workflowStatusOption/${workflowStatusOptionId}?scopes=steps`);
  }

  public updateWorkflowStatus(operationId, toStatusOptionId): Observable<any> {
    const options = {
      data: {
        workflowStatusOptionId: toStatusOptionId
      }
    }

    return this.postToEndpoint('v2/operation/' + operationId + '/moveToStep', options);
  }

  public getPlans(options?: any): Observable<any> {
    const params = _.cloneDeep(options);
    return this.getUrlWrapper('v1/plan', {params, cache: true})
  }

  public getOperations(options?: any): Observable<any> {
    const params = _.cloneDeep(options);
    return this.getUrlWrapper('v2/operation', {params, cache: true})
  }

  public getLocations(): Observable<any> {
    return this.getUrlWrapper('v2/location', {cache: true});
  }

  public getWorkflowStatusOptions (options): Observable<any> {
    const scopeParams = options.scope ? '?scopes=' + options.scope : '';
    return this.getUrlWrapper('v2/workflowStatusOption' + scopeParams);
  }

  public getWorkflowStatusOptionsForOperationVersions (operationVersionIds): Observable<any> {
    return this.getUrlWrapper(`v2/workflowStatusOption/currentForOperationVersion?operationVersionIds=${operationVersionIds.join(',')}`)
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

  public getOrganizations(): Observable<any> {
    return this.getUrlWrapper('v2/organization', {cache: true});
  }

  public autocompleteOrganization(search: string): Observable<any> {
    return this.autocomplete('organization', search);
  }

  public autocompleteEmergency(search: string): Observable<any> {
    return this.autocomplete('emergency', search);
  }

  public autocompleteSector(search: string): Observable<any> {
    return this.autocomplete('globalCluster', search);
  }

  public autocompletePlan(search: string): Observable<any> {
    return this.autocomplete('plan', search);
  }

  private autocomplete(objectType: string, search: string): Observable<any> {
    return this.fetchEndpoint(`v1/object/autocomplete/${objectType}/${search}`).pipe(
      map((res: any) => res.data))
  }

  public getBlueprints(): Observable<any> {
    return this.getUrlWrapper('v2/blueprint', {cache: true});
  }

  public getBlueprint(id: any): Observable<any> {
    return this.getUrlWrapper(`v2/blueprint/${id}`, {cache: true});
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

  public getCdmViaSearch(query: any): Observable<any> {

    const params = {};

    // Need to flatten the arrays in search to be string-separated.
    Object.keys(query).forEach(key => {
      if (Array.isArray(query[key])) {
        params[key] = query[key].join(',');
      } else {
        params[key] = query[key];
      }
    })

    const options = {params, cache: true };

    return this.getUrlWrapper('v2/plan', options)
  }

  public getParticipantByHid(hid: string): Observable<any> {
    return this.getUrlWrapper('v2/participant/hidId/' + hid);
  }

  public getAllParticipants(): Observable<any> {
    return this.getUrlWrapper('v2/participant');
  }

  public getAllPlans(): Observable<any> {
    return this.getUrlWrapper('v2/plan');
  }

  public getAllRoles(): Observable<any> {
    return this.getUrlWrapper('v2/role');
  }

  public getAllGloablClusters(): Observable<any> {
    return this.getUrlWrapper('v1/global-cluster');
  }

  public getAllOrganizations(): Observable<any> {
    return this.getUrlWrapper('v2/organization');
  }

  public getParticipantById(id: number): Observable<any> {
    return this.getUrlWrapper('v1/participant/' + id);
  }
  public getgoveningEntityById(id: number): Observable<any> {
    return this.getUrlWrapper('v2/governingEntity/' + id);
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

  public csvDownload(url): Observable<any> {
    return this.http.get(url);
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
