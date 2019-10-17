import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, from, forkJoin } from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';
import { SubmissionsService } from './submissions.service';
import { ToastrService } from 'ngx-toastr';
import { OperationState, EntityState, AttachmentState } from './operation.state';
import { Operation, Entity, EntityPrototype, Attachment } from './operation.models';
import * as moment from 'moment';


function buildOperation(op): Operation {
  const v = op.operationVersion;
  return {
    version: v.code,
    name: v.name,
    description: v.description
  }
}

function buildAttachment(att, report?: any): Attachment {
  const v = att.opAttachmentVersion;
  const value = report
    && report.dataReportVersion
    && report.dataReportVersion.value;
  const finalized = value && value.finalized;
  const comments = value && value.comments;
  return {
    id: att.id,
    status: !report ? 0 : !finalized ? 1 : 2,
    versionId: v.id,
    formId: v.customReference,
    formName: v.value.name,
    formFile: v.value.file,
    comments
  };
}

const ENTITY_NAME_LIMIT = 10;
function buildEntity(ge, v): Entity {
  const ta = v.technicalArea;
  const limit = ENTITY_NAME_LIMIT;
  const tooLong = ta.length > limit;
  let name = ta.slice(0,  tooLong ? limit : ta.length);
  name += tooLong ? '...' : '';
  return {
    id: ge.id,
    versionId: v.id,
    name,
    technicalArea: v.technicalArea,
    icon: v.icon,
    activationDate: moment(v.activationDate).toDate(),
    deactivationDate: moment(v.deactivationDate).toDate(),
    activationLetter: v.activationLetter,
    deactivationLetter: v.deactivationLetter,
    notes: v.notes
  };
}

function buildEntityPrototype(ep): EntityPrototype {
  const version = ep.opEntityPrototypeVersion;
  return {
    id: ep.id,
    type: version.type,
    refCode: version.refCode,
    value: version.value,
  }
}

function updatedFile(entity, oldEntity, fieldName): boolean {
  const field = entity[fieldName];
  return field && field.name && field.lastModified && !field.id;
}

@Injectable({providedIn: 'root'})
export class OperationService {
  api: ApiService;
  submissions: SubmissionsService;
  toastr: ToastrService;
  operationState: OperationState;
  entityState: EntityState;
  attachmentState: AttachmentState;
  public id: number;
  public operation: any;
  public reportingWindow: any;
  public report: any;
  newAttachment = {id: null, formId: '', formName: '', formFile: null};

  private readonly _mode = new BehaviorSubject<string>('');
  private readonly _route = new BehaviorSubject<string>('');
  private readonly _processing = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);

  private readonly _selectedAttachmentId = new Subject<number>();

  readonly mode$ = this._mode.asObservable();
  readonly route$ = this._route.asObservable();
  readonly processing$ = this._processing.asObservable();
  readonly saving$ = this._saving.asObservable();
  readonly selectedAttachmentId$ = this._selectedAttachmentId.asObservable();

  constructor(
    submissions: SubmissionsService,
    api: ApiService,
    // authService: AuthService,
    operationState: OperationState,
    entityState: EntityState,
    attachmentState: AttachmentState,
    toastr: ToastrService) {
    this.api = api;
    this.submissions = submissions;
    this.toastr = toastr;
    this.operationState = operationState;
    this.entityState = entityState;
    this.attachmentState = attachmentState;
  }

  // State related exposed functions
  get attachments$(): Observable<Attachment[]> { return this.operationState.attachments$ };
  get entities$(): Observable<Entity[]> { return this.operationState.entities$ };
  get entities(): Entity[] { return this.operationState.entities; }
  get entityPrototypes$(): Observable<EntityPrototype[]> { return this.operationState.entityPrototypes$ };
  get entityAttachments$(): Observable<Attachment[]> { return this.entityState.attachments$ };
  get selectedAttachment$(): Observable<Attachment> { return this.attachmentState.attachment$ };
  get selectedEntityPrototype(): EntityPrototype { return this.entityState.prototype };
  get selectedEntity(): Entity { return this.entityState.entity };
  get selectedEntity$(): Observable<Entity> { return this.entityState.entity$ };
  set selectedAttachment(val: Attachment) { this.attachmentState.attachment = val; }
  set selectedEntity(val: Entity) {
    this.entityState.entity = val;
    if(val && this.route === 'EDIT_ENTITY_ATTACHMENTS') {
      this.mode = null;
      this.loadEntityAttachments(val.id, false);
    }
  }

  set selectedAttachmentId(attachmentId: number) {
    this.api.getReport(attachmentId, this.reportingWindow.id)
    .subscribe(report => {
      this.report = report;
      if(report) {
        this.report.finalized =
          report.dataReportVersion &&
          report.dataReportVersion.value &&
          report.dataReportVersion.value.finalized;
        this.submissions.tempSubmission =
          report.dataReportVersion &&
          report.dataReportVersion.value &&
          report.dataReportVersion.value.submission;
      } else {
        this.submissions.tempSubmission = {};
      }
    });
    this._selectedAttachmentId.next(attachmentId);
  }
  get mode(): string { return this._mode.getValue(); }
  set mode(val: string) {
    if(val === 'ADD_ENTITY') {
      this.entityState.entity = null;
    } else if(val === 'ADD_OPERATION_ATTACHMENT') {
      this.attachmentState.attachment = this.newAttachment;
    } else if(val === 'ADD_ENTITY_ATTACHMENT') {
      this.attachmentState.attachment = this.newAttachment;
    }
    this._mode.next(val);
  }
  get route(): string { return this._route.getValue(); }
  set route(val: string) { this._route.next(val); }

  get processing(): boolean { return this._processing.getValue(); }
  set processing(val: boolean) { this._processing.next(val); }

  get saving(): boolean { return this._saving.getValue(); }
  set saving(val: boolean) { this._saving.next(val); }

  _saveOperationAttachment(attachment: Attachment) {
    try {
      let objectId = this.id;
      let objectType = 'operation';
      let opAttachmentPrototypeId = 1;
      if(this.route === 'EDIT_ENTITY_ATTACHMENTS') {
        objectId = this.entityState.entity.id;
        objectType = 'opGoverningEntity';
        opAttachmentPrototypeId = this.entityState.prototype.id;
      }
      this.api.saveOperationAttachment({
        id: attachment.id,
        operationId: this.id,
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
      }).subscribe(response => {
        if(attachment.id) {
          this.toastr.success('Attachment save.', 'Attachment updated');
        } else {
          this.toastr.success('Attachment save.', 'Attachment created');
        }
        const idx = this.operationState.attachments.indexOf(this.operationState.attachments.find(a => !a.id));
        attachment.id = response.id;
        this.operationState.attachments[idx] = {...attachment};
        this.operationState.attachments = [...this.operationState.attachments];
        if(this.route === 'EDIT_ENTITY_ATTACHMENTS') {
          this.loadEntityAttachments(this.entityState.entity.id);
        } else {
          this.loadAttachments(this.id);
        }
        this.attachmentState.attachment = attachment;
        this.mode = null;
        this.saving = false;
      });
    } catch (e) {
      this.saving = false;
      console.error(e);
    }
  }

  async saveAttachment(attachment: Attachment, oldAttachment?: Attachment) {
    if(!attachment.formFile.id) {//file has not been uploaded or has been updated
      this.saving = true;
      const originalName = attachment.formFile.name;
      this.api.saveOperationAttachmentFile(attachment.formFile).subscribe(file => {
        attachment.formFile = {
          id: file.id,
          name: originalName,
          filepath: file.file
        };
        this._saveOperationAttachment(attachment);
      })
    } else {
      this._saveOperationAttachment(attachment);
    }
  }

  removeAttachment(id: any) {
    // optimistic update
    const attachment = this.operationState.attachments.find(a => a.id === id);
    this.operationState.attachments = this.operationState.attachments.filter(a => a.id !== id);
    try {
      this.api.deleteOperationAttachment(id).subscribe(response => {
        if(response.status !== 'ok') {
          throw new Error('Unable to delete attachment');
        }
        this.toastr.success('Attachment remove.', 'Attachment removed');
      });
    } catch (e) {
      console.error(e);
      this.operationState.attachments = [...this.operationState.attachments, attachment];
    }
  }

  loadAttachments(operationId: number, route?: string) {
    this.processing = true;
    if(route) { this.route = route; }
    this.operationState.attachments = [];
    this.loadOperation(operationId).subscribe(() => {
      this.api.getOperationAttachments(operationId).subscribe(response => {
        const opas = response.opAttachments;
        if(opas.length) {
          forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
          .subscribe(reports => {
            this.processing = false;
            this.operationState.attachments = reports.map((r, i) => {
              return buildAttachment(opas[i], r);
            }).sort((a, b) => (a.id > b.id) ? 1 : -1);
            this.processing = false;
          });
        } else {
          this.processing = false;
        }
      });
    })
  }

  loadEntityAttachments(entityId: number, includeReports: boolean = true) {
    this.processing = true;
    this.entityState.attachments = [];
    this.api.getGoverningEntity(entityId, ['opAttachments'])
      .subscribe(response => {
        const opas = response.opAttachments;
        if(includeReports) {
          forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
          .subscribe(reports => {
            this.entityState.attachments = reports.map((r, i) => {
              return buildAttachment(opas[i], r);
            });
            this.processing = false;
          });
        } else {
          this.entityState.attachments = opas.map(opa => buildAttachment(opa));
          this.processing = false;
        }
      });
  }

  loadEntities(entityPrototypeId: number, operationId?: number) {
    this.processing = true;
    this.operationState.entities = [];
    this.loadOperation(operationId || this.id).subscribe(response => {
      const opep = response.opEntityPrototypes
        .filter(ep => ep.id == entityPrototypeId);

      const x = buildEntityPrototype(opep[0]);
      if(!this.entityState.prototype || this.entityState.prototype.id !== x.id) {
        this.entityState.prototype = x;
      }
      this.operationState.entities = response.opGoverningEntities
        .filter(ge => ge.opEntityPrototype.id == entityPrototypeId)
        .map(ge => buildEntity(ge, ge.opGoverningEntityVersion));
      this.processing = false;
    });
  }

  loadEntityPrototypes(operationId?: number) {
    this.loadOperation(operationId || this.id).subscribe(response => {
      this.operationState.entityPrototypes = response.opEntityPrototypes
        .map(ep => buildEntityPrototype(ep));
    });
  }

  loadEntityPrototype(operationId: number, id: number) {
    this.loadOperation(operationId).subscribe(response => {
      const entityPrototype = response.opEntityPrototypes
        .filter(ep => ep.id === id);
      return entityPrototype ? entityPrototype[0] : null;
    });
  }

  formatDbEntity(entity, activationFile, deactivationFile): any {
    const obj: any = {
      id: entity.id,
      operationId: this.id,
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

  _saveEntity(entity, activationFile, deactivationFile) {
    const xentity = this.formatDbEntity(entity, activationFile, deactivationFile);
    this.api.saveGoverningEntity(xentity).subscribe(() => {
      if(entity.id) {
        this.toastr.success('Governing entity updated.', 'Governing entity updated');
      } else {
        this.toastr.success('Governing entity create.', 'Governing entity created');
      }
      this.loadEntities(this.entityState.prototype.id);
      this.mode = null;
    });
  }

  addEntity(entity, oldEntity, operationId?: number) {
    const token = new Date().valueOf();
    const refCode = this.entityState.prototype.refCode;
    if(updatedFile(entity, oldEntity, 'activationLetter')) {
      let uid = `${refCode}A${token}${entity.activationLetter.name}`;
      this.api.saveFile(entity.activationLetter, uid).subscribe(activationFile=> {
        if(entity.deactivationLetter && entity.deactivationLetter.name && !entity.deactivationLetter.id) {
          uid = `${refCode}D${token}${entity.deactivationLetter.name}`;
          this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
            this._saveEntity(entity, activationFile, deactivationFile);
          });
        } else {
          this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
        }
      });
    } else {
      if(updatedFile(entity, oldEntity, 'deactivationLetter')) {
        const uid = `${refCode}${token}${entity.deactivationLetter.name}`;
        this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
          this._saveEntity(entity, entity.activationLetter, deactivationFile);
        });
      } else {
        this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
      }
    }
  }

  removeEntity(entityId: number) {
    this.api.deleteOperationGve(entityId).subscribe(() => {
      this.toastr.success('Governing entity remove.', 'Governing entity removed');
      this.loadEntities(this.entityState.prototype.id, this.id);
      this.entityState.entity = null;
    })
  }

  private loadOperation(operationId: number): any {
    return from(new Promise(resolve => {
      this.id = operationId;
      this.ensureReportingWindowExists(operationId).subscribe(() => {
        this.api.getOperation(operationId).subscribe(response => {
          this.operation = buildOperation(response);
          resolve(response);
        });
      });
    }));
  }

  // TODO temporary hack to get around having a reporting window
  private ensureReportingWindowExists(operationId) {
    const p = new Promise(resolve => {
      this.api.getReportingWindows(operationId).subscribe(rws => {
        const reportingWindow = rws.filter(rw => rw.operationId == operationId);
        if(reportingWindow.length > 0) {
          this.reportingWindow = reportingWindow[0];
          resolve();
        } else {
          this.api.saveReportingWindow({
            operationId,
            startDate: new Date(new Date().getFullYear(), 0, 1),
            endDate: new Date(new Date().getFullYear(), 11, 31),
            status: 'active'
          }).subscribe(response => {
            this.reportingWindow = response;
            resolve();
          })
        }
      });
    });
    return from(p);
  }

  /*private checkPermissionOperation(operationId) {
    if (!this.authService.participant) {
      this.authService.fetchParticipant().subscribe(participant => {
        if (participant && participant.roles) {
          if (participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
            return true;
          }
        }
      });
    } else {
      if (this.authService.participant && this.authService.participant.roles) {
        if (this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
          return true;
        }
      }
    }
    let haveAccess = false;
    if (this.authService.participant && this.authService.participant.roles) {
      this.authService.participant.roles.forEach((role:any)=> {
        role.participantRoles.forEach((pR:any)=> {
          console.log(pR,operationId);
          if (pR.objectType === 'operation' && pR.objectId === +operationId) {
            haveAccess = true;
          }
        });
      });
    }
    return haveAccess;
  }
  private checkPermissionGe(ge) {
    ge.isEditable = false;
    if (!this.authService.participant) {
      this.authService.fetchParticipant().subscribe(participant => {
        if (participant && participant.roles) {
          if (participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
            return true;
          }
        }
      });
    } else {
      if (this.authService.participant && this.authService.participant.roles) {
        if (this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
          return true;
        }
      }
    }
    if (this.authService.participant && this.authService.participant.roles) {
      this.authService.participant.roles.forEach((role:any)=> {
        role.participantRoles.forEach((pR:any)=> {
          if (pR.objectType === 'operation' && pR.objectId === this.operation.id) {
            ge.isEditable = true;
          }
          if (pR.objectType === 'opGoverningEntity' && pR.objectId  === ge.id) {
            ge.isEditable = true;
          }
        });
      });
    }
    return ge.isEditable;
    }*/
}
