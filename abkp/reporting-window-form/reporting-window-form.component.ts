import {zip as observableZip,  Observable } from 'rxjs';

import {filter} from 'rxjs/operators';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';

import { AuthService } from '@hpc/core';
import { ApiService, ReportingWindowService } from '@cdm/core';
import { ReportingWindow } from '@hpc/data';
// import { ComponentCanDeactivate } from 'app/shared/services/auth/pendingChanges.guard.service';
// import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'reporting-window-form',
  templateUrl: './reporting-window-form.component.html',
  styleUrls: ['./reporting-window-form.component.scss']
})
export class ReportingWindowFormComponent implements OnInit {//}, ComponentCanDeactivate {

  reportingWindow: ReportingWindow;
  processing = true;
  editable = true;
  canSubmitReportingWindow = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private rw: ReportingWindowService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    observableZip(
      this.route.params,
      this.route.queryParamMap,
      this.route.data
    ).subscribe(results => {
      const id = +results[0]['id'];
      const version = results[1].get('version');
      const data = results[2];
      if (id && id !== NaN) {
        if (data && data.title === 'View ReportingWindow') {
          this.rw.editMode = false;
        }
        this.loadForExistingReportingWindow(id, version);
      } else {
        this.loadNewReportingWindow();
      }
    });
  }

  public loadForExistingReportingWindow (id: number, version = 'latest') {
    this.rw.fetchReportingWindow(id, version)
      .subscribe(() => {
        this.afterLoadReportingWindow();
      }, (err) => {
        if (err.status === 404) {
          this.processing = false;
          this.router.navigate(['/']);

          this.toastr.error(`We couldn\'t find that reportingWindow, is the ID
            right? Maybe you still have to create it,
            or you don\'t have permission to view it?`,
            'ReportingWindow Not Found', {
            disableTimeOut: true
          })
        }
      });
  }

  public loadNewReportingWindow() {
    this.authService.fetchParticipant()
      .subscribe(() => {
        const reportingWindow = new ReportingWindow({
          editableByUser: true,
          status:'notYetOpen',
          context: null,
          startDate: null,
          endDate: null,
          value: {},
        });
        this.rw.reportingWindowDoneLoading(reportingWindow);
        this.afterLoadReportingWindow();
      });
  }

  private determineStepAccess () {
    const reportingWindow = this.createReportingWindowService.reportingWindow;
    this.allRouteSteps = [];
    if (reportingWindow && reportingWindow.id) {
        this.allRouteSteps.push({
          route: ['/reporting-window', reportingWindow.id, 'edit','detail'],
          accessible: true,
          display: true,
          step: 'detail',
          name: 'Reporting Window details',
          title: 'Edit the basic information of the reporting window'
        });
        this.allRouteSteps.push({
          route: ['/reporting-window', reportingWindow.id, 'edit','elements'],
          accessible: true,
          display: true,
          step: 'elements',
          name: 'Elements',
          title: 'Add elements to the reporting window'
        });
        this.allRouteSteps.push({
          route: ['/reporting-window', reportingWindow.id, 'edit','workflow'],
          accessible: true,
          display: true,
          step: 'worflow',
          name: 'Worflow',
          title: 'Define workflow for the reporting window'
        });
    } else {
        this.allRouteSteps.push({
          route: ['/reporting-window','create','detail'],
          accessible: true,
          step: 'detail',
          display: true,
          name: 'Reporting Window details',
          title: 'Edit the basic information of the operation'
        });
    }

    this.setEditableMode();

    this.setCurrentStepIdx(this.allRouteSteps);

    this.displayRouteSteps = this.allRouteSteps.filter((step:any) => step.display);
    this.setCurrentStepIdx();
  }

  private setCurrentStepIdx (useAllRoutes?:any) {
    this.currentChildRoute = this.route.firstChild.routeConfig.path;
    this.currentStepIdx = _.findIndex(useAllRoutes || this.displayRouteSteps, ['step', this.currentChildRoute]);
  }

  public save (nextOrPrevious:any) {
    if (this.currentChildComponent.registerForm) {
      const invalidKeys = [];
      const minMax = []; // will keep the list of fields failing min / max value validation
      _.forEach(this.currentChildComponent.registerForm.controls, (value, key) => {
        if (value['status'] === 'INVALID') {
          const validationErrors = Object.keys(value['errors']);
          if (validationErrors.indexOf('appMax') !== -1) {
            minMax.push(`"${key} ${this.translate.instant('operation-edit.response-plan.max-err')} ${value['errors']['appMax']}`);
          }
          if (validationErrors.indexOf('appMin') !== -1) {
            minMax.push(`"${key}" ${this.translate.instant('operation-edit.response-plan.min-err')} ${value['errors']['appMin']}`);
          }
          invalidKeys.push(key);
        }
      });

      if (invalidKeys.length) {
        this.toastr.error(invalidKeys.join('\n'), this.translate.instant('Fill in all fields'))
        if (minMax.length) {
          this.toastr.error(minMax.join('\n'), this.translate.instant('operation-edit.response-plan.validation-err'));
        };
        return;
      }
    }

    this.processing = true;

    if (this.currentChildComponent.save) {
      this.currentChildComponent.save()
        .subscribe((result:any) => {
          if (result.submitted) {
            this.processing = false;
            this.determineStepAccess();
            return;
          }
          if (result.isNew) {
            this.allRouteSteps = [];
          }
          if (result.stopSave) {
            this.processing = false;
            this.currentChildComponent.registerForm.pristine = true;
            this.chooseNextComponentView(nextOrPrevious, this.createReportingWindowService.reportingWindow.id, result);
          } else {
            this.apiService.saveReportingWindow(this.createReportingWindowService.reportingWindow)
              .subscribe((updatedReportingWindow:any) => {
                this.createReportingWindowService.reportingWindowDoneLoading(updatedReportingWindow);
                this.processing = false;
                this.chooseNextComponentView(nextOrPrevious, updatedReportingWindow.id);
              });
          }
        }, (err:any) => {
          this.toastr.warning(err);
          console.error('err', err);

            this.apiService.getOperation(this.createReportingWindowService.reportingWindow.id).subscribe(notSavedReportingWindow => {
              this.createReportingWindowService.reportingWindowDoneLoading(notSavedReportingWindow);
              this.processing = false;
            });
          this.processing = false;
        });
    } else {
      this.apiService.saveOperation(this.createReportingWindowService.reportingWindow)
        .subscribe(updatedReportingWindow => {
          this.createReportingWindowService.reportingWindowDoneLoading(updatedReportingWindow);
          this.processing = false;
          this.chooseNextComponentView(nextOrPrevious, updatedReportingWindow.id);
        }, (err) => {
          console.error('err', err);
          this.processing = false;
        });
    }
  }

  private chooseNextComponentView (nextOrPrevious:any, reportingWindowId?:any, options = {isNew: false}) {
    this.determineStepAccess();
    if (nextOrPrevious === 'next') {
      this.nextStep();
    } else if (nextOrPrevious === 'previous') {
      this.previousStep()
    } else if (options.isNew && nextOrPrevious === undefined) {
      this.router.navigate(['/reporting-window', reportingWindowId, 'edit', 'detail'])
    }
  }

  public onActivate (component:any) {
    this.currentChildComponent = component;
  }

  public goToPreviousStep(checkIfChangesAndSave:any) {
    if (!this.canDeactivate() && checkIfChangesAndSave) {
      const confirmed = confirm(this.translate.instant('Confirm going to previous'));
      if (confirmed) {
        this.previousStep();
      }
    } else {
      this.previousStep();
    }
  }

  public previousStep () {
    this.router.navigate(this.displayRouteSteps[this.currentStepIdx - 1].route)
  }

  public nextStep () {
    const route = this.displayRouteSteps[this.currentStepIdx + 1].route;
    this.router.navigate(route);
  }

  private afterLoadReportingWindow () {
    this.processing = false;

    this.determineStepAccess();
  }

  private setEditableMode () {
    if (this.createReportingWindowService.reportingWindow) {
      this.editable = true;//this.createReportingWindowService.reportingWindow.editableByUser;
    }
  }
  public canDeactivate(): Observable<boolean> | boolean {
    return (this.currentChildComponent === undefined ||
      !(this.currentChildComponent.registerForm && !this.currentChildComponent.registerForm.pristine));
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
