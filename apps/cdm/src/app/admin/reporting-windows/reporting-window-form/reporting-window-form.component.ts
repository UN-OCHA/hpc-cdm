import { zip as observableZip, Observable, of } from 'rxjs';
import { filter, startWith, mergeMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ApiService, AuthService, ModeService } from '@hpc/core';
import { ReportingWindow } from '@hpc/data';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'reporting-window-form',
  templateUrl: './reporting-window-form.component.html',
  styleUrls: ['./reporting-window-form.component.scss']
})
export class ReportingWindowFormComponent implements OnInit {
  form: FormGroup;
  editMode: boolean = false;
  title: string;
  reportingWindow: ReportingWindow;
  separatorKeysCodes: number[] = [ENTER, COMMA]; optionCtrl = new FormControl();
  filteredOptions: Observable<any>;
  displayValues: any[] = [];
  selectedValues: any[] = [];
  operations: any[];
  contextTypeOptions: any = [
    { label: 'Plan', value: '2', checked: false },
    { label: 'Operations', value: '3', checked: false },
    { label: 'Global', value: '1', checked: false }
  ];
  @ViewChild('optionInput', { static: false }) optionInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private modeService: ModeService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      id:[''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      contextType: ['', Validators.required],
      status:['']
    });

    this.api.getOperations().subscribe(res => {
      this.operations = res;
    });
  }

  ngOnInit() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      mergeMap((value: string | null) =>
        value && value.length > 2 ? this._filter(value, this.form.value.contextType) : []));
    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.modeService.mode = 'edit';
        this.editMode = true;
        this.api.getReportingWindow(params.id).subscribe(rw => {
          this.form.patchValue({
            name: rw.name,
            description: rw.description,
            startDate: rw.startDate,
            endDate: rw.endDate,
            contextType: rw.planId ? "2" : "3",    
            id: params.id  ,
            status: rw.status     
                      });
          if(rw.planId) {
            this.api.getPlan(rw.planId).subscribe(plan => {
              if(plan) {
                this.displayValues.push(plan.planVersion.name);
                this.selectedValues.push(plan.id);
              }
            });
          } else {
            this.api.getOperation(rw.operationId).subscribe(operation => {
              if(operation) {
             this.displayValues.push(operation.operationVersion.name);
             this.selectedValues.push(operation.id);
            }
            });
          }
        });
      } else {
        this.modeService.mode = 'add';
      }
    });
  }
  remove(value: string): void {
    let index = this.displayValues.indexOf(value);
    if (index >= 0) {
      this.displayValues.splice(index, 1);
      this.selectedValues.splice(index, 1);
    }
  }

  populateDates(type) {
    let from, to;
    if (type === 'currentyear') {
      from = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
      to = new Date(new Date().getFullYear(), 11, 31, 0, 0, 0);
      this.form.patchValue({
        startDate: new Date(from),
        endDate: new Date(to)
      });
    } else if (type === 'previousyear') {
      from = new Date(new Date().getFullYear() - 1, 0, 1, 0, 0, 0);
      to = new Date(new Date().getFullYear() - 1, 11, 31, 0, 0, 0);
      this.form.patchValue({
        startDate: new Date(from),
        endDate: new Date(to)
      });
    } else if (type === 'currentquarter') {
      from = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
      to = this.getLastdateOfTheMonth(new Date().getMonth() + 3);
      this.form.patchValue({
        startDate: new Date(from),
        endDate: new Date(to)
      });
    } else if (type === 'previousquarter') {
      from = new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1, 0, 0, 0);
      to = this.getLastdateOfTheMonth(new Date().getMonth());
      this.form.patchValue({
        startDate: new Date(from),
        endDate: new Date(to)
      });
    }
  }
  getLastdateOfTheMonth(month) {
    return new Date(new Date().getFullYear(), month, 0);
  }

  private _filter(value: string, contextType: string): Observable<any> {
    const filterValue = value.toLowerCase();
    if (contextType === "3") {
    return of(this.operations.filter(option => option.operationVersion.name.toLowerCase().includes(filterValue)));
    } else {
     return this.api.autocompletePlan(filterValue);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void { 
    this.displayValues.push(event.option.viewValue);
    this.selectedValues.push(event.option.value);
    this.optionInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  onSubmit() {
    if (this.form.valid) {
      let reportingWindow = this.form.value;
      if (this.form.value.contextType === "3") {
        reportingWindow.operationId = this.selectedValues.join(',');
      } else  if(this.form.value.contextType === "2") {
        reportingWindow.planId = this.selectedValues.join(',');
      }
      let message = reportingWindow.id ? "Reporting window updated" : "Reporting window created"
      this.api.saveReportingWindow(reportingWindow).subscribe(res => {
        this.toastr.success(message);
        this.router.navigate(['/rwindows']);
      });
    }
  }

  contextTypeChange() {
  this.displayValues =[];
  this.selectedValues=[]; 
 
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

  public save(nextOrPrevious: any) {
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
    //         this.apiService.getOperapopulateDates
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
