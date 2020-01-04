import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
// import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';

export interface ProcessState {
  up: boolean;
  loading: boolean;
}

let _state: ProcessState = {
  up: true,
  loading: false
};


@Injectable({providedIn: 'root'})
export class ProcessService {

  private store = new BehaviorSubject<ProcessState>(_state);
  private state$ = this.store.asObservable();

  up$ = this.state$.pipe(map(state => state.up), distinctUntilChanged());
  loading$ = this.state$.pipe(map(state => state.loading), distinctUntilChanged());

  vm$: Observable<ProcessState> = combineLatest(this.up$, this.loading$)
    .pipe(map( ([up, loading]) => {
      return { up, loading };
    })
  );

  // constructor(private http: HttpClient) {
  //   combineLatest(this.up$, this.loading$).pipe(
  //     switchMap(([up, loading]) => {
  //       // return this.findAllUsers(up, loading)
  //     })
  //   ).subscribe(users => {
  //     this.updateState({ ..._state, users, loading: false });
  //   })
  // }

  // getStateSnapshot(): ProcessState {
  //   return {..._state, pagination, loading: true});
  // }
  //
  // private up = true;
  // private loading = 0;

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

  // api error catcher for program control
  private processError(error: any): Observable<any> {
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
}
