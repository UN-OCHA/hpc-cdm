/**
 * Responsible for formatting api objects with UI models.
 * Intended to decouple the ui vs api formats to provides a single point
 * of reference which should:
 * - simplify maintenance on any future api response updates/enhancements
 * - make obvious/transparent/traceable all data being submitted to the api
 * - increase code testability
 */
import { Injectable } from '@angular/core';
import { OperationState, EntityState, RouteState } from './operation.state';
import { Entity, Attachment } from './operation.models';

@Injectable({providedIn: 'root'})
export class Formatter {
  private operationState: OperationState;
  private entityState: EntityState;
  private routeState: RouteState;

  constructor(
    operationState: OperationState,
    entityState: EntityState,
    routeState: RouteState) {
    this.operationState = operationState;
    this.entityState = entityState;
    this.routeState = routeState;
  }

  formatDbEntity(entity: Entity, activationFile, deactivationFile): any {
    const obj: any = {
      id: entity.id,
      operationId: this.operationState.operation.id,
      opEntityPrototypeId: this.entityState.prototype.id,
      opGoverningEntityVersion: {
        icon: entity.icon,
        technicalArea: entity.technicalArea,
        activationDate: entity.activationDate,
        notes: entity.notes
      }
    };
    if(entity.deactivationDate) {
      obj.opGoverningEntityVersion.deactivationDate = entity.deactivationDate;
    }
    if(activationFile) {
      obj.opGoverningEntityVersion.activationLetter = {
        id: activationFile.id,
        name: entity.activationLetter.name,
        filepath: activationFile.file
      };
    } else {
      obj.opGoverningEntityVersion.activationLetter = null;
    }
    if(deactivationFile) {
      obj.opGoverningEntityVersion.deactivationLetter = {
        id: deactivationFile.id,
        name: entity.deactivationLetter.name,
        filepath: deactivationFile.file
      };
    } else {
      obj.opGoverningEntityVersion.deactivationLetter = null;
    }
    return obj;
  }

  formatAttachment(attachment: Attachment): any {
    let objectId = this.operationState.operation.id;
    let objectType = 'operation';
    let opAttachmentPrototypeId = 1;
    if(this.routeState.route === 'EDIT_ENTITY_ATTACHMENTS') {
      objectId = this.entityState.entity.id;
      objectType = 'opGoverningEntity';
      opAttachmentPrototypeId = this.entityState.prototype.id;
    }

    return {
      id: attachment.id,
      operationId: this.operationState.operation.id,
      objectId,
      objectType,
      opAttachmentPrototypeId,
      type: 'form',
      opAttachmentVersion: {
        customReference: attachment.formId,
        value: {
          name: attachment.formName,
          file: attachment.formFile
        }
      }
    }
  }
}
