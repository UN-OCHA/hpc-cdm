import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import {map} from 'rxjs/operators';

import { ReportingWindow } from './reporting-window.model';

// import { ApiService } from '@hpc/core';

import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class CreateReportingWindowService {

  public reportingWindow: ReportingWindow;
  public isNewReportingWindow = true;
  public editable = false;
  public processing = 0;
  public editMode = true;

  private reportingWindowLoadedSource = new Subject<boolean>();
  public reportingWindowHasLoaded$ = this.reportingWindowLoadedSource.asObservable();

  constructor(
    // private apiService: ApiService,
  ) {}

  public fetchReportingWindow(id: number, version = 'latest') {
    // TODO vimago
    // let subscription = this.apiService.getReportingWindow(id, version);
    // return subscription.pipe(
    //   map(reportingWindow => {
    //     this.isNewReportingWindow = false;
    //     reportingWindow.exists = true;
    //     this.reportingWindowDoneLoading(reportingWindow);
    //   }));
  }

  public reportingWindowDoneLoading(reportingWindow: ReportingWindow) {
    this.reportingWindow = new ReportingWindow(reportingWindow);
    this.reportingWindowLoadedSource.next(true);
  }

  public unmask(num: any): number {
    if (num) {
      const newNumber = (num.toString().replace(/,/gi, ''));
      return +newNumber;
    } else {
      return num;
    }
  }
}
