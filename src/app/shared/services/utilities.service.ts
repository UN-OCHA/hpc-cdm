
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {zip as observableZip,  Observable, of } from 'rxjs';
import {mapTo, switchMap, map, catchError} from 'rxjs/operators';

import { ApiService } from 'app/shared/services/api/api.service';

@Injectable()
export class UtilitiesService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  public getRelevantProcedureSteps (
    governingEntityLeadForIds: Array<number>,
    planLeadForIds: Array<number>,
    plans: Array<any>,
    projectId: number
  ): Observable<any> {
    let procedure;
    return this.getRelevantProcedureForUser(governingEntityLeadForIds, planLeadForIds, plans).pipe(
      switchMap((foundProcedure) => {
        procedure = foundProcedure;
        if (procedure) {
          return this.apiService.getProcedureSteps(plans[0].id, projectId)
        } else {
          return of(false);
        }
      }), map(steps => {
        return [procedure, steps];
      }));
  }

  public getRelevantProcedureForUser (governingEntityLeadForIds, planLeadForIds, plans: Array<any>): Observable<any> {
    let mappedPlansAsObservables = [];

    if (governingEntityLeadForIds && governingEntityLeadForIds.length) {
      mappedPlansAsObservables.push(...plans.map(projectPlan => {
        if (projectPlan.governingEntities) {
          const pGE = projectPlan.governingEntities.find(gE => governingEntityLeadForIds.indexOf(gE.id) !== -1);
          if (pGE) {
            return of(projectPlan);
          } else { return false; }
        } else {
          return this.apiService.getPlan(projectPlan.id, 'governingEntities,procedure').pipe(
            map(plan => {
              const foundGE = plan.governingEntities.find(gE => governingEntityLeadForIds.indexOf(gE.id) !== -1);
              if (foundGE) {
                return plan;
              } else { return false; }
            }));
        }
      }));
    }

    if (planLeadForIds && planLeadForIds.length) {
      mappedPlansAsObservables.push(...plans.map(projectPlan => {
        if (planLeadForIds.indexOf(projectPlan.id) !== -1) {
          return this.apiService.getPlan(projectPlan.id, 'governingEntities,procedure')
        }
        return of(false);
      }));
    }

    // Finally attach the first plan attached to the project
    // as a back-up. If something else if found first
    // then that will be used.
    if (plans && plans.length) {
      mappedPlansAsObservables = mappedPlansAsObservables.concat(of(plans[0]));
    }

    return observableZip(...mappedPlansAsObservables).pipe(
      map(foundPlansOrFalse => {
        const plan = foundPlansOrFalse.find((foundValue: any | boolean) => { return foundValue || false; });
        if (plan) {
          return plan;
        }
      }));
  }

  public downloadProjects(ids: Array<number>, downloadOptions: any): Observable<any> {
    downloadOptions.errorDownloading = false;
    downloadOptions.fetchingDownloadZip = true;
    downloadOptions.zipLocation = null;

    return this.apiService.getProjectPDFs(ids, downloadOptions.forceRegeneration).pipe(
      map(result => {
        if (result.zipUrl) {
          let i = 0;
          const intervalId = setInterval(() => {
            this.doesFileExist(result.zipUrl).then(function (status) {
              if ( status === true || i > 500 ) {
                clearInterval(intervalId);
                downloadOptions.zipLocation = result.zipUrl;
                downloadOptions.fetchingDownloadZip = false;
                if ( i > 500 ) {
                  downloadOptions.zipLocation = null;
                  downloadOptions.errorDownloading = true;
                }
                return downloadOptions;
              }
            });
            i++;
          }, 10000);
        }
      }), catchError(() => {
        downloadOptions.errorDownloading = true;
        downloadOptions.fetchingDownloadZip = false;
        return downloadOptions;
      }));
  }

  private doesFileExist(path: string): Promise<boolean> {
    return this.http.head(path).pipe(
        mapTo(true),
        catchError(() => of(false)))
        .toPromise();
  }
}
