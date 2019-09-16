
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
import { CreateOperationService } from 'app/operation/services/create-operation.service';

import { Operation } from 'app/operation/models/view.operation.model';
import { ComponentCanDeactivate } from 'app/shared/services/auth/pendingChanges.guard.service';

@Component({
  selector: 'app-create-operation',
  templateUrl: './create-operation.component.html',
  styleUrls: ['./create-operation.component.scss'],
  providers: [CreateOperationService]
})
export class CreateOperationComponent implements OnInit, ComponentCanDeactivate {
  public operation: Operation;
  public processing = true;
  public editable = true;
  public submittedModalRef: BsModalRef;
  public canSubmitOperation = false;

  public currentChildComponent:any;
  public currentChildRoute = '';

  public currentStepIdx = 0;
  public displayRouteSteps = [];
  private routeStepsGenerated = false;
  private allRouteSteps: any = [];

  @ViewChild('submittedModal') submittedModal: TemplateRef<any>;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    public createOperationService: CreateOperationService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {
  }

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
        if (data && data.title === 'View Operation') {
          this.createOperationService.editMode = false;
        }
        this.loadForExistingOperation(id, version);
      } else {
        this.loadNewOperation();
      }

      this.createOperationService.operationHasLoaded$
        .subscribe(() => {
          this.determineStepAccess();
        });
      this.router.events.pipe(
        filter(evt => evt instanceof NavigationEnd))
        .subscribe(() => {
          this.determineStepAccess();
        });
    });
  }

  public onLoadOperation (id: number) {
    this.loadForExistingOperation(id);
  }

  public loadForExistingOperation (id: number, version = 'latest') {
    this.createOperationService.fetchOperation(id, version, !this.createOperationService.editMode)
      .subscribe(() => {
        this.afterLoadOperation();
      }, (err) => {
        if (err.status === 404) {
          this.processing = false;
          this.router.navigate(['/']);

          this.toastr.error(`We couldn\'t find that operation, is the ID
            right? Maybe you still have to create it,
            or you don\'t have permission to view it?`,
            'Operation Not Found', {
            disableTimeOut: true
          })
        }
      });
  }

  public loadNewOperation() {
    this.authService.fetchParticipant()
      .subscribe(() => {
        const operation = new Operation({
          editableByUser: true,
          operationVersion: {},
          emergencies: [],
          locations: []
        });

        this.createOperationService.operationDoneLoading(operation);
        this.afterLoadOperation();
      });
  }

  private setEditableMode () {
    if (this.createOperationService.operation) {
      this.editable = true;//this.createOperationService.operation.editableByUser;
    }
  }

  public save (nextOrPrevious:any) {
    if (this.currentChildComponent.childForm) {
      const invalidKeys = [];
      const minMax = []; // will keep the list of fields failing min / max value validation
      _.forEach(this.currentChildComponent.childForm.form.controls, (value, key) => {
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

    // If the child component does a save, do that
    if (this.currentChildComponent.save) {
      this.currentChildComponent.save()
        .subscribe((result:any) => {
          if (result.submitted) {
            this.processing = false;
            this.submittedModalRef = this.modalService.show(this.submittedModal, {class: 'modal-lg'});
            this.determineStepAccess();
            return;
          }
          if (result.isNew) {
            this.routeStepsGenerated = false;
            this.allRouteSteps = [];
          }
          if (result.stopSave) {
            this.processing = false;
            this.currentChildComponent.childForm.form.pristine = true;
            this.chooseNextComponentView(nextOrPrevious, this.createOperationService.operation.id, result);
          } else {
            this.apiService.saveOperation(this.createOperationService.operation)
              .subscribe(updatedOperation => {
                this.createOperationService.operationDoneLoading(updatedOperation);
                this.processing = false;
                this.chooseNextComponentView(nextOrPrevious, updatedOperation.id);
              });
          }
        }, (err:any) => {
          this.toastr.warning(err);
          console.error('err', err);

            this.apiService.getOperation(this.createOperationService.operation.id).subscribe(notSavedOperation => {
              this.createOperationService.operationDoneLoading(notSavedOperation);
              this.processing = false;
            });
          this.processing = false;
        });
    } else {
      this.apiService.saveOperation(this.createOperationService.operation)
        .subscribe(updatedOperation => {
          this.createOperationService.operationDoneLoading(updatedOperation);
          this.processing = false;
          this.chooseNextComponentView(nextOrPrevious, updatedOperation.id);
        }, (err) => {
          console.error('err', err);
          this.processing = false;
        });
    }
  }

  private chooseNextComponentView (nextOrPrevious:any, operationId?:any, options = {isNew: false}) {
    this.determineStepAccess();
    if (nextOrPrevious === 'next') {
      this.nextStep();
    } else if (nextOrPrevious === 'previous') {
      this.previousStep()
    } else if (options.isNew && nextOrPrevious === undefined) {
      this.router.navigate(['/operation', operationId, 'edit', 'basic'])
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

  private afterLoadOperation () {
    this.processing = false;

    this.determineStepAccess();
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

  private setCurrentStepIdx (useAllRoutes?:any) {
    this.currentChildRoute = this.route.firstChild.routeConfig.path;
    this.currentStepIdx = _.findIndex(useAllRoutes || this.displayRouteSteps, ['step', this.currentChildRoute]);
  }

  private determineStepAccess () {
    const operation = this.createOperationService.operation;
    if (operation && operation.id) {
      if (!this.routeStepsGenerated) {

        this.allRouteSteps.push({
          route: ['/operation', operation.id, 'edit','basic'],
          accessible: true,
          display: true,
          step: 'basic',
          name: 'Operation details',
          title: 'Edit the basic information of the operation'
        });

        let attachmentFound = false;
        operation.opAttachmentPrototypes.forEach(aP => {
          if (!attachmentFound) {
            if (aP.opAttachmentPrototypeVersion.value.entities.indexOf('OP')) {
              attachmentFound = true;
              this.allRouteSteps.push({
                route: ['/operation', operation.id, 'edit','attachments'],
                accessible: true,
                step: 'attachments',
                display: true,
                name: 'Operation attachments'
              });
            }
          }
        });
        if (operation && operation.opEntityPrototypes && operation.opEntityPrototypes.length) {
          operation.opEntityPrototypes.forEach(eP => {
            this.allRouteSteps.push({
              route: ['/operation', operation.id, 'edit','gves', eP.id],
              accessible: true,
              step: 'gves/:entityPrototypeId',
              display: true,
              name: eP.opEntityPrototypeVersion.value.name.en.plural
            });
            let attachmentFound = false;
            operation.opAttachmentPrototypes.forEach(aP => {
              if (!attachmentFound) {
                if (aP.opAttachmentPrototypeVersion.value.entities.filter((entity:any) => entity === eP.opEntityPrototypeVersion.refCode).length) {
                  attachmentFound = true;
                  this.allRouteSteps.push({
                    route: ['/operation', operation.id, 'edit','gves-attachments', eP.id],
                    accessible: true,
                    step: 'gves-attachments/:entityPrototypeId',
                    display: true,
                    name: eP.opEntityPrototypeVersion.value.name.en.plural + ' attachments'
                  });
                }
              }
            });
          });
        }

        this.allRouteSteps.push({
          route: ['/operation', operation.id, 'edit','review'],
          accessible: false,
          display: false,
          step: 'review',
          rule: [],
          name: 'Review'
        });
        this.routeStepsGenerated = true;
      }
    } else {
      if (!this.routeStepsGenerated) {
        this.allRouteSteps.push({
          route: ['/operation','create','basic'],
          accessible: true,
          step: 'basic',
          display: true,
          name: 'Operation details',
          title: 'Edit the basic information of the operation'
        });

        this.allRouteSteps.push({
          route: ['/operation', operation.id, 'edit','review'],
          accessible: false,
          step: 'review',
          display: false,
          rule: [],
          name: 'Review'
        });
        this.routeStepsGenerated = true;
      }
    }
    this.canSubmitOperation = true;

    this.setEditableMode();

    this.setCurrentStepIdx(this.allRouteSteps);

    // TODO: check why current index is not set correctly sometimes
    this.allRouteSteps.forEach((step:any, idx:any) => {
      if (idx < this.currentStepIdx) {
        step.accessible = true;
      } else if (idx === this.currentStepIdx) {
        step.accessible = true;
      }
    });

    this.displayRouteSteps = this.allRouteSteps.filter((step:any) => step.display);
    this.setCurrentStepIdx();
  }

}
