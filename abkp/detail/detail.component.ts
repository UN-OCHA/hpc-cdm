import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { ReportingWindowService } from '../reporting-windows.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@hpc/core';

//import { ReportingWindow } from 'app/reporting-window/models/reporting-window.model';

import * as moment from 'moment';

// import { ReportingWindowChildFormComponent } from '../child/child.component';


@Component({
  selector: 'reporting-window-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class ReportingWindowDetailComponent implements OnInit {

  @Input() entry: any;
  public registerForm: FormGroup;

  constructor(
    public apiService: ApiService,
    private fb: FormBuilder,
    // public createReportingWindowService: CreateReportingWindowService
  ) {

      // super(createReportingWindowService, apiService);
      this.registerForm = this.fb.group({
        name: ['', Validators.required],
        context: [''],
        description: [''],
        status: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      });
    }

  ngOnInit() {
    this.reset();
  }

  reset() {
    // this.registerForm.reset({
    //   name: this.createReportingWindowService.reportingWindow.value.name,
    //   description: this.createReportingWindowService.reportingWindow.value.description,
    //   context: this.createReportingWindowService.reportingWindow.value.context,
    //   status: this.createReportingWindowService.reportingWindow.status,
    //   startDate: this._date(this.createReportingWindowService.reportingWindow.startDate),
    //   endDate: this._date(this.createReportingWindowService.reportingWindow.endDate)
    // });
  }

  save(): Observable<any>{
    const formData = this.registerForm.value;
    const reportingWindow = {
      // id: this.createReportingWindowService.reportingWindow.id || null,
      status: formData.status,
      startDate:formData.startDate,
      endDate:formData.endDate,
      value: {
        name: formData.name,
        description: formData.description,
        context: formData.context
      }

    };
    return this.apiService.saveReportingWindow(reportingWindow)
    .pipe(map((response:any) => {
      // this.createReportingWindowService.reportingWindow = response;
      this.reset();
      return {
        stopSave: true
      };
    }));
  }

  _date(value:any) {
    return value ? moment(value).toDate(): null;
  }
}
