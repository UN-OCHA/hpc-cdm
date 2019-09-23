import {zip as observableZip,  Observable } from 'rxjs';

import {filter} from 'rxjs/operators';
import { Component, OnInit, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';

import { ApiService } from 'app/shared/services/api/api.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { CreateReportingWindowService } from 'app/reporting-window/services/create-reporting-window.service';

import { ReportingWindow } from 'app/reporting-window/models/reporting-window.model';
import { ComponentCanDeactivate } from 'app/shared/services/auth/pendingChanges.guard.service';

@Component({
  selector: 'app-create-reporting-window',
  templateUrl: './create-reporting-window.component.html',
  styleUrls: ['./create-reporting-window.component.scss'],
  providers: [CreateReportingWindowService]
})
export class CreateReportingWindowComponent implements OnInit , ComponentCanDeactivate {

  public reportingWindow: ReportingWindow;
  public processing = true;
  public editable = true;
  public canSubmitOperation = false;

  public currentChildComponent:any;
  public currentChildRoute = '';

  public currentStepIdx = 0;
  public displayRouteSteps = [];
  private allRouteSteps: any = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    public createReportingWindowService: CreateReportingWindowService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
  }

  public canDeactivate(): Observable<boolean> | boolean {
    return (this.currentChildComponent === undefined ||
      !(this.currentChildComponent.childForm && !this.currentChildComponent.childForm.form.pristine));
  }

  // TODO: can we make this a mixin or something like that?
  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.canDeactivate()) {
      $event.returnValue = `This message is displayed to the user in IE and Edge
        when they navigate without using Angular routing (type another URL/close the browser/etc)`;
    }
  }
}
