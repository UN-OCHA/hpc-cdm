import { zip as observableZip,  Subject } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { Operation } from '../models/view.operation.model';

import { ApiService } from 'app/shared/services/api/api.service';

import * as _ from 'lodash';

@Injectable()
export class CreateOperationService {
  public operation: Operation;
  public isNewOperation = true;
  public editable = false;
  public processing = 0;
  public editMode = true;

  private operationLoadedSource = new Subject<boolean>();
  public operationHasLoaded$ = this.operationLoadedSource.asObservable();

  constructor(
    private apiService: ApiService,
    private oauthService: OAuthService,
  ) {}

  public fetchOperation(id: number, version = 'latest', isPublic?) {
    let subscription = this.apiService.getOperation(id, version);
    if (isPublic && !this.oauthService.hasValidAccessToken()) {
      subscription = this.apiService.getPublicOperation(id, ['all']);
    }
    return subscription.pipe(
      map(operation => {
        this.isNewOperation = false;
        operation.exists = true;
        this.operationDoneLoading(operation);
      }));
  }

  public operationDoneLoading(operation: Operation) {
    this.operation = new Operation(operation);
    this.operationLoadedSource.next(true);
  }

  public setExistingGoverningEntitiesAsSelected (operation, planGoverningEntity) {
    let foundGoverningEntity = false;
    operation.governingEntities.forEach(operationGE => {
      if (operationGE.id === planGoverningEntity.id) {
        planGoverningEntity.selected = true;
        foundGoverningEntity = true;
      }
    });
    return foundGoverningEntity;
  }

  public getGoverningEntitiesFromPlan(operation?) {
    operation = operation || this.operation;

    operation.plans.map(plan => {
      plan.viewingGoverningEntityIdx = null;
      if (plan.governingEntities) {
        plan.governingEntities.forEach((gE, idx) => {
          this.setExistingGoverningEntitiesAsSelected(operation, gE);
          if (!gE.children || (gE.children && !gE.children.length)) {
            gE.childPlanEntities = [];
            this.associateOperationAttachmentsToEntities(gE, null, null);
          } else {
            gE.childPlanEntities = gE.children
              .filter(child => child.childType === 'planEntity')
              .reduce((planEntities, child) => {
                const planEntity = _.find(plan.planEntities, ['id', child.childId]);

                if (planEntity &&
                  plan.procedureEntityPrototypes &&
                  plan.procedureEntityPrototypes.length &&
                  plan.procedureEntityPrototypes.map(function(e) { return e.entityPrototypeId; })
                    .indexOf(planEntity.entityPrototype.id) !== -1) {
                  const typeName = planEntity.planEntityVersion.value.type.en.plural
                  if (planEntities[typeName]) {
                    planEntities[typeName].push(planEntity);
                  } else {
                    planEntities[typeName] = [planEntity];
                  }
                  this.associateOperationAttachmentsToEntities(gE, planEntities, typeName);

                } else {
                  this.associateOperationAttachmentsToEntities(gE, null, null);
                }
                return planEntities;
              }, {});
          }
          gE.caseloads = gE.attachments.filter(attachment => {
            return attachment.type === 'caseLoad';
          });

          if (!plan.viewingGoverningEntityIdx && gE.selected) {
            plan.viewingGoverningEntityIdx = idx;
          }
        });
      }
    });
  }

  private associateOperationAttachmentsToEntities (gE, planEntities, typeName) {
    this.operation.attachments.forEach(operationAttachment => {
      gE.attachments.forEach(entityAttachment => {
        if (operationAttachment.attachmentId === entityAttachment.id) {
          entityAttachment.operationVersionId = operationAttachment.operationVersionId;
          entityAttachment.attachmentVersionId = operationAttachment.attachmentVersionId;
          entityAttachment.operationValue = operationAttachment.total;
        }
      });
      if ( planEntities && typeName) {
        planEntities[typeName].forEach(entity => {
          entity.attachments.forEach(entityAttachment => {
            if (operationAttachment.attachmentId === entityAttachment.id) {
              entityAttachment.selected = true;
              entityAttachment.operationVersionId = operationAttachment.operationVersionId;
              entityAttachment.attachmentVersionId = operationAttachment.attachmentVersionId;
              entityAttachment.operationValue = operationAttachment.total;
            }
          });
        });
      }
    });
  }

  public unmask(num: any): number {
    if (num) {
      const newNumber = (num.toString().replace(/,/gi, ''));
      return +newNumber;
    } else {
      return num;
    }
  }

  public fetchAndOverwriteGoverningEntities (operation?) {
    operation = operation || this.operation;
    const isPublic = !this.editMode && !this.oauthService.hasValidAccessToken();
    return observableZip(
      this.apiService.getGoverningEntitiesForOperation(operation.id, isPublic),
      this.apiService.getGlobalClustersforOperation(operation.id, isPublic)
    ).pipe(map(results => {
      operation.governingEntities = results[0];
      operation.globalClusters = results[1];
    }))
  }
}
