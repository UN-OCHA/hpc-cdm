import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, from, forkJoin } from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';
import { SubmissionsService } from './submissions.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

export interface Attachment {
  id?: any;
  versionId?: any;
  status?: any;
  formId: any;
  formName: any;
  formFileId?: number;
  formFilePath?: string;
  formFileName?: string;
  comments?: string;
}

export interface Entity {
  id?: any;
  versionId?: any;
  name?: any;
  technicalArea: any;
  activationDate: any;
  deactivationDate: any;
  activationLetter: any;
  deactivationLetter: any;
  notes: string;
}

export interface EntityPrototype {
  id: number;
  value: any;
  type: string;
  refCode: string;
}

function buildAttachment(att, report): Attachment {
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
    formFileId: v.value.fileId,
    formFileName: v.value.fileName,
    formFilePath: v.value.file,
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
    activationDate: moment(v.activationDate).toDate(),
    deactivationDate: moment(v.deactivationDate).toDate(),
    activationLetter: v.activationLetter,
    deactivationLetter: v.deactivationLetter,
    notes: v.notes
  };
}

function buildEntityPrototype(ep): EntityPrototype {
  console.log(ep)
  const version = ep.opEntityPrototypeVersion;
  return {
    id: ep.id,
    type: version.type,
    refCode: version.refCode,
    value: version.value,
  }
}


@Injectable({providedIn: 'root'})
export class OperationService {
  api: ApiService;
  submissions: SubmissionsService;
  toastr: ToastrService;
  public id: number;
  public operation: any;
  public reportingWindow: any;
  public report: any;
  // private _selectedEntityIdx: number;
  private _selectedEntityPrototypeIdx: number;

  private readonly _mode = new BehaviorSubject<string>();
  private readonly _route = new BehaviorSubject<string>();
  private readonly _entityPrototypes = new BehaviorSubject<EntityPrototype[]>([]);
  private readonly _selectedEntityPrototype = new BehaviorSubject<EntityPrototype>();
  private readonly _entities = new BehaviorSubject<Entity[]>([]);
  private readonly _selectedEntity = new BehaviorSubject<Entity>();
  private readonly _entityAttachments = new BehaviorSubject<Attachment[]>([]);
  private readonly _selectedAttachmentId = new Subject<number>();
  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);

  readonly mode$ = this._mode.asObservable();
  readonly route$ = this._route.asObservable();
  readonly selectedEntityPrototype$ = this._selectedEntityPrototype.asObservable();
  readonly selectedEntity$ = this._selectedEntity.asObservable();
  readonly selectedAttachmentId$ = this._selectedAttachmentId.asObservable();
  readonly attachments$ = this._attachments.asObservable();
  readonly entities$ = this._entities.asObservable();
  readonly entityPrototypes$ = this._entityPrototypes.asObservable();
  readonly entityAttachments$ = this._entityAttachments.asObservable();

  constructor(
    submissions: SubmissionsService,
    api: ApiService,
    toastr: ToastrService) {
    this.api = api;
    this.submissions = submissions;
    this.toastr = toastr;
  }

  // get selectedEntityIdx(): number { return this._selectedEntityIdx; }
  // set selectedEntityIdx(val: number) {
  //   this._selectedEntityIdx = val;
  //   this.getEntityAttachments(val);
  // }

  get selectedEntityPrototypeIdx(): number { return this._selectedEntityPrototypeIdx; }
  set selectedEntityPrototypeIdx(val: number) {
    this._selectedEntityPrototypeIdx = val;
  }

  get selectedEntity(): Entity { return this._selectedEntity.getValue(); }
  set selectedEntity(val: Entity) {
    this._selectedEntity.next(val);
    if(val && this.route === 'EDIT_ENTITY_ATTACHMENTS') {
      this.getEntityAttachments(val.id);
    }
  }

  get selectedEntityPrototype(): EntityPrototype { return this._selectedEntityPrototype.getValue(); }
  set selectedEntityPrototype(val: EntityPrototype) {
    this._selectedEntityPrototype.next(val);
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
    console.log('simona............................')
    console.log(val)
    this._mode.next(val);
    console.log(this.mode)
    if(val === 'ADD_ENTITY') {
      this.selectedEntity = null;
    }
  }
  get route(): string { return this._route.getValue(); }
  set route(val: string) {
    this._route.next(val);
  }
  get attachments(): Attachment[] { return this._attachments.getValue(); }
  set attachments(val: Attachment[]) { this._attachments.next(val); }
  get entities(): Entity[] { return this._entities.getValue(); }
  set entities(val: Entity[]) { this._entities.next(val); }
  get entityPrototypes(): EntityPrototype[] { return this._entityPrototypes.getValue(); }
  set entityPrototypes(val: EntityPrototype[]) { this._entityPrototypes.next(val); }
  get entityAttachments(): Attachment[] { return this._entityAttachments.getValue(); }
  set entityAttachments(val: Attachment[]) { this._entityAttachments.next(val); }

  // async addAttachment(attachment: Attachment, operationId?: any) {
  //   if(attachment) {
  //     try {
  //       this.api.saveOperationAttachment({
  //         objectId: operationId,
  //         objectType:'operation',
  //         opAttachmentPrototypeId:1,
  //         type: 'form',
  //         opAttachmentVersion: {
  //           customReference: attachment.formId,
  //           value: {
  //             name: attachment.formName,
  //             file: attachment.formFilePath,
  //             fileId: attachment.formFileId,
  //             fileName: attachment.formFileName
  //           }
  //         }
  //       }, attachment.id).subscribe(response => {
  //         const idx = this.attachments.indexOf(this.attachments.find(a => !a.id));
  //         attachment.id = response.id;
  //         this.attachments[idx] = {...attachment};
  //         this.attachments = [...this.attachments];
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // }

  // async removeAttachment(id: any) {
  //   // optimistic update
  //   const attachment = this.attachments.find(a => a.id === id);
  //   this.attachments = this.attachments.filter(a => a.id !== id);
  //   try {
  //     this.api.deleteOperationAttachment(id).subscribe(response => {
  //       if(response.status !== 'ok') {
  //         throw new Error('Unable to delete attachment');
  //       }
  //     });
  //   } catch (e) {
  //     console.error(e);
  //     this.attachments = [...this.attachments, attachment];
  //   }
  // }

  getAttachments(operationId: number) {
    this.loadOperation(operationId).subscribe(() => {
      this.api.getOperationAttachments(operationId).subscribe(response => {
        const opas = response.opAttachments;
        forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
        .subscribe(reports => {
          this.attachments = reports.map((r, i) => {
            return buildAttachment(opas[i], r);
          });
        });
      });
    })
  }

  getEntityAttachments(entityId: number) {
    this.api.getGoverningEntity(entityId, ['opAttachments'])
      .subscribe(response => {
        const opas = response.opAttachments;
        forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
        .subscribe(reports => {
          this.entityAttachments = reports.map((r, i) => {
            return buildAttachment(opas[i], r);
          });
        });
      });
  }

  // getEntities(operationId: number) {
  //   this.loadOperation(operationId).subscribe(response => {
  //     this.entities = response.opGoverningEntities.map(ge => {
  //       return this.buildEntity(ge, ge.opGoverningEntityVersion);
  //     });
  //     this.selectedEntityIdx = this.entities.length ? 0 : null;
  //   });
  // }

  getEntities(entityPrototypeId: number, operationId?: number) {
    console.log('getting>>>>>>>>>>>>>>>>>>>>>>>')
    console.log(operationId || this.id);
    console.log(entityPrototypeId)
    this.loadOperation(operationId || this.id).subscribe(response => {
      const opep = response.opEntityPrototypes.filter(ep => ep.id == entityPrototypeId);
      const x = buildEntityPrototype(opep[0]);
      if(!this.selectedEntityPrototype || this.selectedEntityPrototype.id !== x.id) {
        this.selectedEntityPrototype = x;
      }
      console.log('setting entities>>>>>>>>>>>>>>>>>>>>>>>>>>')
      this.entities = response.opGoverningEntities
        .filter(ge => ge.opEntityPrototype.id == entityPrototypeId)
        .map(ge => buildEntity(ge, ge.opGoverningEntityVersion));
      // this.selectedEntityIdx = this.entities.length ? 0 : null;
      this.selectedEntity = null;
    });
  }

  getEntityPrototypes(operationId?: number) {
    this.loadOperation(operationId || this.id).subscribe(response => {
      this.entityPrototypes = response.opEntityPrototypes
        .map(ep => buildEntityPrototype(ep));
    });
  }

  getEntityPrototype(operationId: number, id: number) {
    this.loadOperation(operationId).subscribe(response => {
      const entityPrototype = response.opEntityPrototypes
        .filter(ep => ep.id === id);
      return entityPrototype ? entityPrototype[0] : null;
    });
  }
  //   this.entity = op.opEntityPrototypes.filter(eP=> eP.id === this.entityPrototypeId)[0];
  //   this.list = op.opGoverningEntities.filter(gve => gve.opEntityPrototype.id === this.entityPrototypeId);

  formatDbEntity(entity, activationFile, deactivationFile) {
    return {
      id: entity.id,
      operationId: this.id,
      opEntityPrototypeId: this.selectedEntityPrototype.id,
      opGoverningEntityVersion: {
        technicalArea: entity.technicalArea,
        activationDate: entity.activationDate,
        activationLetter: {
          id: activationFile.id,
          name: entity.activationLetter.name,
          filepath: activationFile.file
        },
        deactivationDate: entity.deactivationDate,
        deactivationLetter: {
          id: deactivationFile.id,
          name: entity.deactivationLetter.name,
          filepath: deactivationFile.file
        },
        notes: entity.notes
      }
    };
  }

  _saveEntity(entity, activationFile, deactivationFile) {
    const xentity = this.formatDbEntity(entity, activationFile, deactivationFile);
    this.api.saveGoverningEntity(xentity).subscribe(() => {
      if(entity.id) {
        this.toastr.success('Governing entity updated.', 'Governing entity updated');
      } else {
        this.toastr.success('Governing entity create.', 'Governing entity created');
      }
      this.getEntities(this.selectedEntityPrototype.id);
      // this.selectedEntity = entity;
      this.mode = null;
    });
  }

  addEntity(entity, oldEntity, operationId?: number) {
    console.log('==========================================1');
    console.log(entity);
    console.log(oldEntity);
    const entityId = entity.id;
    console.log(entityId);
    console.log('==========================================2');

    // TODO clean and parallelize calls
    const token = new Date().valueOf();
    const refCode = this.selectedEntityPrototype.refCode;

    if(!entity.activationLetter.id) {
      let uid = `${refCode}${token}${entity.activationLetter.name}`;
      this.api.saveFile(entity.activationLetter, uid).subscribe(activationFile=> {
        if(!entity.deactivationLetter.id) {
          uid = `${refCode}${token}${entity.deactivationLetter.name}`;
          this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
            this._saveEntity(entity, activationFile, deactivationFile);
          });
        }
      });
    } else {
      if(!entity.deactivationLetter.id) {
        const uid = `${refCode}${token}${entity.deactivationLetter.name}`;
        this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
          this._saveEntity(entity, entity.activationLetter, deactivationFile);
        });
      } else {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        console.log(entity)
        this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
      }
    }
  }

  removeEntity(entityId: number) {
    this.api.deleteOperationGve(entityId).subscribe(() => {
      this.toastr.success('Governing entity remove.', 'Governing entity removed');
      this.getEntities(this.selectedEntityPrototype.id, this.id);
      this.selectedEntity = null;
    })
  }

  private loadOperation(operationId: number): any {
    return from(new Promise(resolve => {
      this.id = operationId;
      this.ensureReportingWindowExists(operationId).subscribe(() => {
        this.api.getOperation(operationId).subscribe(response => {
          this.operation = response;
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
}
