import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {map} from 'rxjs/operators';

// import { ApiService } from '@hpc/core';
// import { RWindow } from '@hpc/data';


@Injectable({ providedIn: 'root' })
export class ReportingWindowService {

  // public rwindow: RWindow;
  rwindow: any;
  isNewReportingWindow = true;
  editable = false;
  processing = 0;
  editMode = true;

  // rwindowLoadedSource = new Subject<boolean>();
  // rwindowHasLoaded$ = this.rwindowLoadedSource.asObservable();

  // constructor(private api: ApiService) {}

  // fetchRWindow(id: number, version = 'latest') {
  //   let subscription = this.api.getReportingWindow(id, version);
  //   return subscription.pipe(
  //     map(reportingWindow => {
  //       this.isNewReportingWindow = false;
  //       reportingWindow.exists = true;
  //       this.reportingWindowDoneLoading(reportingWindow);
  //     }));
  // }
  //
  // reportingWindowDoneLoading(reportingWindow: any) {
  //   // this.reportingWindow = new ReportingWindow(reportingWindow);
  //   console.log(reportingWindow)
  //   this.rwindow = reportingWindow;//new ReportingWindow(reportingWindow);
  //   this.rwindowLoadedSource.next(true);
  // }
  //
  // unmask(num: any): number {
  //   if (num) {
  //     const newNumber = (num.toString().replace(/,/gi, ''));
  //     return +newNumber;
  //   } else {
  //     return num;
  //   }
  // }
}
