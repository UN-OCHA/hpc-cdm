import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {zip as observableZip,  Observable } from 'rxjs';
import {filter} from 'rxjs/operators';
import { AppService, AuthService, ModeService } from '@hpc/core';
import { ReportingWindow } from '@hpc/data';

@Component({
  selector: 'reporting-window-form',
  templateUrl: './reporting-window-form.component.html',
  styleUrls: ['./reporting-window-form.component.scss']
})
export class ReportingWindowFormComponent implements OnInit {//}, ComponentCanDeactivate {
  form: FormGroup;
  title: string;
  reportingWindow$ = this.appService.reportingWindow$;
  // processing = true;
  // canSubmitReportingWindow = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private appService: AppService,
    private modeService: ModeService,
    // private rw: ReportingWindowService,
    // private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      context: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.modeService.mode = 'edit';
        this.appService.loadReportingWindow(params.id);
        // this.form.reset({
        // });
      } else {
        this.modeService.mode = 'add';
      }
    });

    // observableZip(
    //   this.route.params,
    //   this.route.queryParamMap,
    //   this.route.data
    // ).subscribe(results => {
    //   const id = +results[0]['id'];
    //   const version = results[1].get('version');
    //   const data = results[2];
    //   if (id && id !== NaN) {
    //     if (data && data.title === 'View ReportingWindow') {
    //       this.rw.editMode = false;
    //     }
    //     this.loadForExistingReportingWindow(id, version);
    //   } else {
    //     this.loadNewReportingWindow();
    //   }
    // });
  }

  // public loadForExistingReportingWindow (id: number, version = 'latest') {
  //   this.rw.fetchReportingWindow(id, version)
  //     .subscribe(() => {
  //       this.afterLoadReportingWindow();
  //     }, (err) => {
  //       if (err.status === 404) {
  //         this.processing = false;
  //         this.router.navigate(['/']);
  //
  //         this.toastr.error(`We couldn\'t find that reportingWindow, is the ID
  //           right? Maybe you still have to create it,
  //           or you don\'t have permission to view it?`,
  //           'ReportingWindow Not Found', {
  //           disableTimeOut: true
  //         })
  //       }
  //     });
  // }

  // public loadNewReportingWindow() {
  //   this.authService.fetchParticipant()
  //     .subscribe(() => {
  //       const reportingWindow = new ReportingWindow({
  //         editableByUser: true,
  //         status:'notYetOpen',
  //         context: null,
  //         startDate: null,
  //         endDate: null,
  //         value: {},
  //       });
  //       // this.rw.reportingWindowDoneLoading(reportingWindow);
  //       // this.afterLoadReportingWindow();
  //     });
  // }

  // {
  //   route: ['/rwindow', rw.id, 'edit','detail'],
  //   accessible: true, display: true, step: 'detail',
  //   name: 'Reporting Window details',
  //   title: 'Edit the basic information of the reporting window'
  // },
  // {
  //   route: ['/rwindow', rw.id, 'edit','elements'],
  //   accessible: true,
  //   display: true,
  //   step: 'elements',
  //   name: 'Elements',
  //   title: 'Add elements to the reporting window'
  // },
  // {
  //   route: ['/rwindow', rw.id, 'edit','workflow'],
  //   accessible: true,
  //   display: true,
  //   step: 'worflow',
  //   name: 'Worflow',
  //   title: 'Define workflow for the reporting window'
  // },
  // {
  //   route: ['/rwindow','create','detail'],
  //   accessible: true,
  //   step: 'detail',
  //   display: true,
  //   name: 'Reporting Window details',
  //   title: 'Edit the basic information of the operation'
  // }

  public save (nextOrPrevious:any) {
    // if (this.currentChildComponent.registerForm) {
    //   const invalidKeys = [];
    //   const minMax = []; // will keep the list of fields failing min / max value validation
    //   _.forEach(this.currentChildComponent.registerForm.controls, (value, key) => {
    //     if (value['status'] === 'INVALID') {
    //       const validationErrors = Object.keys(value['errors']);
    //       if (validationErrors.indexOf('appMax') !== -1) {
    //         minMax.push(`"${key} ${this.translate.instant('operation-edit.response-plan.max-err')} ${value['errors']['appMax']}`);
    //       }
    //       if (validationErrors.indexOf('appMin') !== -1) {
    //         minMax.push(`"${key}" ${this.translate.instant('operation-edit.response-plan.min-err')} ${value['errors']['appMin']}`);
    //       }
    //       invalidKeys.push(key);
    //     }
    //   });
    //
    //   if (invalidKeys.length) {
    //     this.toastr.error(invalidKeys.join('\n'), this.translate.instant('Fill in all fields'))
    //     if (minMax.length) {
    //       this.toastr.error(minMax.join('\n'), this.translate.instant('operation-edit.response-plan.validation-err'));
    //     };
    //     return;
    //   }
    // }
    //
    // this.processing = true;
    //
    // if (this.currentChildComponent.save) {
    //   this.currentChildComponent.save()
    //     .subscribe((result:any) => {
    //       if (result.submitted) {
    //         this.processing = false;
    //         this.determineStepAccess();
    //         return;
    //       }
    //       if (result.isNew) {
    //         this.allRouteSteps = [];
    //       }
    //       if (result.stopSave) {
    //         this.processing = false;
    //         this.currentChildComponent.registerForm.pristine = true;
    //         this.chooseNextComponentView(nextOrPrevious, this.createReportingWindowService.reportingWindow.id, result);
    //       } else {
    //         this.apiService.saveReportingWindow(this.createReportingWindowService.reportingWindow)
    //           .subscribe((updatedReportingWindow:any) => {
    //             this.createReportingWindowService.reportingWindowDoneLoading(updatedReportingWindow);
    //             this.processing = false;
    //             this.chooseNextComponentView(nextOrPrevious, updatedReportingWindow.id);
    //           });
    //       }
    //     }, (err:any) => {
    //       this.toastr.warning(err);
    //       console.error('err', err);
    //
    //         this.apiService.getOperation(this.createReportingWindowService.reportingWindow.id).subscribe(notSavedReportingWindow => {
    //           this.createReportingWindowService.reportingWindowDoneLoading(notSavedReportingWindow);
    //           this.processing = false;
    //         });
    //       this.processing = false;
    //     });
    // } else {
    //   this.apiService.saveOperation(this.createReportingWindowService.reportingWindow)
    //     .subscribe(updatedReportingWindow => {
    //       this.createReportingWindowService.reportingWindowDoneLoading(updatedReportingWindow);
    //       this.processing = false;
    //       this.chooseNextComponentView(nextOrPrevious, updatedReportingWindow.id);
    //     }, (err) => {
    //       console.error('err', err);
    //       this.processing = false;
    //     });
    // }
  }


  // TODO: can we make this a mixin or something like that?
  // @HostListener allows us to also guard against browser refresh, close, etc.
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (!this.canDeactivate()) {
  //     $event.returnValue = `This message is displayed to the user in IE and Edge
  //       when they navigate without using Angular routing (type another URL/close the browser/etc)`;
  //   }
  // }
}
