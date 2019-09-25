import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { CreateReportingWindowService } from 'app/reporting-window/services/create-reporting-window.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';

//import { ReportingWindow } from 'app/reporting-window/models/reporting-window.model';

import * as moment from 'moment';

import { CreateReportingWindowChildComponent } from './../create-reporting-window-child/create-reporting-window-child.component';


@Component({
  selector: 'app-reporting-window-detail',
  templateUrl: './reporting-window-detail.component.html',
  styleUrls: ['./reporting-window-detail.component.scss']
})
export class ReportingWindowDetailComponent extends CreateReportingWindowChildComponent implements OnInit {

  @Input() entry: any;
  registerForm: FormGroup;

  constructor(
    public apiService: ApiService,
    private fb: FormBuilder,
    public createReportingWindowService: CreateReportingWindowService) {

      super(createReportingWindowService, apiService);
      this.registerForm = this.fb.group({
        name: ['', Validators.required],
        status: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      });
    }

  ngOnInit() {
    this.reset();
  }

  reset() {
    this.registerForm.reset({
      name: this.createReportingWindowService.reportingWindow.value.name,
      status: this.createReportingWindowService.reportingWindow.status,
      startDate: this._date(this.createReportingWindowService.reportingWindow.startDate),
      endDate: this._date(this.createReportingWindowService.reportingWindow.endDate)
    });
  }

  save(): Observable<any>{
    const formData = this.registerForm.value;
    const reportingWindow = {
      id: this.createReportingWindowService.reportingWindow.id || null,
      status: formData.status,
      startDate:formData.startDate,
      endDate:formData.endDate,
      value: {
        name: formData.name
      }

    };
    return this.apiService.saveReportingWindow(reportingWindow)
    .pipe(map((response:any) => {
      this.createReportingWindowService.reportingWindow = response;
      this.reset();
      return {
        stopSave: true
      };
    }));
  }

  _date(value:any) {
    if (value) {
      return moment(value).toDate();
    }
    return null;
  }
}
