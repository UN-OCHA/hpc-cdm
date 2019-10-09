import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, from, forkJoin } from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';
import { SubmissionsService } from './submissions.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

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
  abbreviation: string;
  name: string;
  activationDate: any;
  comments: string;
  filename?: string;
  isEditable?: boolean;
}

@Injectable({providedIn: 'root'})
export class OperationService {
  api: ApiService;
  authService: AuthService;
  submissions: SubmissionsService;
  public id: number;
  public operation: any;
  public reportingWindow: any;
  public report: any;
  private _selectedEntityIdx: number;

  private readonly _selectedAttachmentId = new Subject<number>();
  readonly selectedAttachmentId$ = this._selectedAttachmentId.asObservable();

  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  readonly attachments$ = this._attachments.asObservable();

  private readonly _entities = new BehaviorSubject<Entity[]>([]);
  readonly entities$ = this._entities.asObservable();

  private readonly _entityAttachments = new BehaviorSubject<Attachment[]>([]);
  readonly entityAttachments$ = this._entityAttachments.asObservable();

  constructor(
    submissions: SubmissionsService,
    authService: AuthService,
    api: ApiService) {
    this.api = api;
    this.authService = authService;
    this.submissions = submissions;
  }

  get selectedEntityIdx(): number { return this._selectedEntityIdx; }
  set selectedEntityIdx(val: number) {
    this._selectedEntityIdx = val;
    this.getEntityAttachments(val);
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
  get attachments(): Attachment[] { return this._attachments.getValue(); }
  set attachments(val: Attachment[]) { this._attachments.next(val); }
  get entities(): Entity[] { return this._entities.getValue(); }
  set entities(val: Entity[]) { this._entities.next(val); }
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
            if (this.checkPermissionOperation(operationId)) {
              this.attachments = reports.map((r, i) => {
                return this.buildAttachment(opas[i], r);
              });
            }
          });
        });
      })
  }

  getEntityAttachments(entityIdx: number) {
    if(this.entities && this.entities.length > entityIdx) {
      this.api.getGoverningEntity(this.entities[entityIdx].id, ['opAttachments'])
      .subscribe(response => {
        const opas = response.opAttachments;
        forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
        .subscribe(reports => {
          this.entityAttachments = reports.map((r, i) => {
            return this.buildAttachment(opas[i], r);
          });
        });
      });
    }
  }

  getEntities(operationId: number) {
    this.loadOperation(operationId).subscribe(response => {
      this.entities = response.opGoverningEntities.filter(ge => {
        if (this.checkPermissionGe(ge)) {
          return this.buildEntity(ge, ge.opGoverningEntityVersion);
        }
      });

      this.selectedEntityIdx = this.entities.length ? 0 : null;
    });
  }

  private buildAttachment(att, report): Attachment {
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

  private buildEntity(ge, v) {
    return {
      id: ge.id,
      versionId: v.id,
      abbreviation: v.customReference,
      name: v.name,
      activationDate: v.activationDate,
      comments: v.comment,
      //TODO filename:
    };
  }

  private loadOperation(operationId: number): any {
    return from(new Promise(resolve => {
      if(this.id === operationId) {
        resolve(this.operation);
      } else {
        this.id = operationId;
        this.ensureReportingWindowExists(operationId).subscribe(() => {
          this.api.getOperation(operationId).subscribe(response => {
            this.operation = response;
            resolve(response);
          });
        });
      }
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

  private checkPermissionOperation(operationId) {
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
    console.log(haveAccess);
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
  }
}
