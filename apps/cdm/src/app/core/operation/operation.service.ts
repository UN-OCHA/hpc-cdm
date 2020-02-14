import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
// import { ApiService } from '@hpc/core';
import { SubmissionsService } from './submissions.service';
// import { ToastrService } from 'ngx-toastr';
import { OperationState, EntityState, AttachmentState, RouteState } from './operation.state';

import {
  Operation, Entity, EntityPrototype, Attachment, AttachmentPrototype,
  buildOperation, buildEntity, buildEntityPrototype,
  buildAttachmentPrototype, buildAttachment
} from '@hpc/data';

import { Formatter } from './operation.formatter';

function updatedFile(entity, oldEntity, fieldName): boolean {
  const field = entity[fieldName];
  return field && field.name && field.lastModified && !field.id;
}

@Injectable({providedIn: 'root'})
export class OperationService {
  // private api: ApiService;
  private submissions: SubmissionsService;
  // private toastr: ToastrService;
  private operationState: OperationState;
  private entityState: EntityState;
  private routeState: RouteState;
  private attachmentState: AttachmentState;
  private formatter: Formatter;
  public reportingWindow: any;
  public report: any;
  newAttachment = { id: null, formId: '', formName: '', formFile: null,collection:null,
  opAttachmentPrototypeId:null,operationId:null,opAttachmentVersion:null,objectId:null, objectType:null };

  constructor(
    submissions: SubmissionsService,
    // api: ApiService,
    formatter: Formatter,
    operationState: OperationState,
    entityState: EntityState,
    attachmentState: AttachmentState,
    routeState: RouteState,
    // toastr: ToastrService
  ) {
    // this.api = api;
    this.submissions = submissions;
    // this.toastr = toastr;
    this.operationState = operationState;
    this.entityState = entityState;
    this.attachmentState = attachmentState;
    this.routeState = routeState;
  }

  // State related exposed functions
  get id(): number { return this.operationState.operation && this.operationState.operation.id; }
  get operation$(): Observable<Operation> { return this.operationState.operation$; }
  get operation(): Operation { return this.operationState.operation; }
  set operation(op: Operation) { this.operationState.operation = op; }
  get attachments(): Attachment[] { return this.operationState.attachments; };
  get attachments$(): Observable<Attachment[]> { return this.operationState.attachments$; };
  get attachmentPrototypes$(): Observable<AttachmentPrototype[]> { return this.operationState.attachmentPrototypes$ };
  get entities$(): Observable<Entity[]> { return this.operationState.entities$ };
  get entities(): Entity[] { return this.operationState.entities; }
  get entityPrototypes$(): Observable<EntityPrototype[]> { return this.operationState.entityPrototypes$ };
  get entityAttachments(): Attachment[] { return this.entityState.attachments; };
  get entityAttachments$(): Observable<Attachment[]> { return this.entityState.attachments$; };
  get selectedAttachment$(): Observable<Attachment> { return this.attachmentState.attachment$; };
  get selectedEntityPrototype(): EntityPrototype { return this.entityState.prototype; };
  get selectedEntity(): Entity { return this.entityState.entity; };
  get selectedEntity$(): Observable<Entity> { return this.entityState.entity$; };
  set selectedAttachment(val: Attachment) {
    if(val && this.routeState.mode === 'REPORTS_VIEW') {
<<<<<<< HEAD

      // TODO vimago what service?
      // this.api.getReport(val.id, this.reportingWindow.id)
      // .subscribe(report => {
      //   this.report = report;
      //   if(report) {
      //     this.report.finalized =
      //       report.dataReportVersion &&
      //       report.dataReportVersion.value &&
      //       report.dataReportVersion.value.finalized;
      //     this.submissions.tempSubmission =
      //       report.dataReportVersion &&
      //       report.dataReportVersion.value &&
      //       report.dataReportVersion.value.submission;
      //   } else {
      //     this.submissions.tempSubmission = {};
      //   }
      // });

=======
      this.api.getReport(val.id, this.reportingWindow.id)
        .subscribe(report => {
          this.report = report;
          if (report) {
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
>>>>>>> cdm-dev
    }
    this.attachmentState.attachment = val;
  }
  set selectedEntity(val: Entity) {
    this.entityState.entity = val;
    if (val && this.routeState.route === 'EDIT_ENTITY_ATTACHMENTS') {
      this.routeState.mode = null;
      this.loadEntityAttachments(val.id, false);
    }
  }
  get route(): string { return this.routeState.route; }
  set route(route: string) { this.routeState.route = route; }
  get processing(): Boolean { return this.routeState.processing; }
  get saving(): Boolean { return this.routeState.saving; }
  get mode(): string { return this.routeState.mode; }
  get mode$(): Observable<string> { return this.routeState.mode$; }
  set mode(mode: string) {
    this.routeState.mode = mode;
    if (mode === 'ADD_ENTITY') {
      this.entityState.entity = null;
    } else if (mode === 'ADD_OPERATION_ATTACHMENT') {
      this.attachmentState.attachment = this.newAttachment;
    } else if (mode === 'ADD_ENTITY_ATTACHMENT') {
      this.attachmentState.attachment = this.newAttachment;
    }
  }

  _saveOperationAttachment(attachment: Attachment) {
    try {
<<<<<<< HEAD
      // TODO vimago what service?
      // this.api.saveOperationAttachment(this.formatter.formatAttachment(attachment))
      // .subscribe(response => {
      //   // if(attachment.id) {
      //   //   this.toastr.success('Attachment save.', 'Attachment updated');
      //   // } else {
      //   //   this.toastr.success('Attachment save.', 'Attachment created');
      //   // }
      //   const idx = this.operationState.attachments.indexOf(this.operationState.attachments.find(a => !a.id));
      //   attachment.id = response.id;
      //   this.operationState.attachments[idx] = {...attachment};
      //   this.operationState.attachments = [...this.operationState.attachments];
      //   if(this.routeState.route === 'EDIT_ENTITY_ATTACHMENTS') {
      //     this.loadEntityAttachments(this.entityState.entity.id);
      //   } else {
      //     this.loadAttachments(this.operationState.operation.id);
      //   }
      //   this.attachmentState.attachment = attachment;
      //   this.routeState.mode = null;
      //   this.routeState.saving = false;
      // });
    } catch (e) {
=======
      this.api.saveOperationAttachment(attachment)
        .subscribe(response => {
          // if(attachment.id) {
          //   this.toastr.success('Attachment save.', 'Attachment updated');
          // } else {
          //   this.toastr.success('Attachment save.', 'Attachment created');
          // }
          const idx = this.operationState.attachments.indexOf(this.operationState.attachments.find(a => !a.id));
          attachment.id = response.id;
          this.operationState.attachments[idx] = { ...attachment };
          this.operationState.attachments = [...this.operationState.attachments];
          if (this.routeState.route === 'EDIT_ENTITY_ATTACHMENTS') {
            this.loadEntityAttachments(this.entityState.entity.id);
          } else {
            this.loadAttachments(this.operationState.operation.id);
          }
          this.attachmentState.attachment = attachment;
          this.routeState.mode = null;
          this.routeState.saving = false;
        });
    } catch (e) {      
>>>>>>> cdm-dev
      this.routeState.saving = false;
      console.error(e);
    }
  }

  async saveAttachment(attachment: Attachment, oldAttachment?: Attachment) {  
    attachment.collection = "forms";
        attachment.opAttachmentPrototypeId = this.operation.attachmentPrototype.id;
        attachment.operationId = this.operation.id,
          attachment.opAttachmentVersion = {
            "customReference": attachment.formId.indexOf('X') == -1 ? `X${attachment.formId}` : attachment.formId,
            "value": {
              "name": attachment.formName,
              "file": {}
            }
          },
        attachment.objectId = this.operation.id;
        attachment.objectType = "operation";
    if (!attachment.formFile.id) {//file has not been uploaded or has been updated
      this.routeState.saving = true;
      const originalName = attachment.formFile.name;
<<<<<<< HEAD
      // TODO vimago what service?
      // this.api.saveOperationAttachmentFile(attachment.formFile).subscribe(file => {
      //   attachment.formFile = {
      //     id: file.id,
      //     name: originalName,
      //     filepath: file.file
      //   };
      //   this._saveOperationAttachment(attachment);
      // })
=======
      this.api.saveOperationAttachmentFile(attachment.formFile).subscribe(file => {
        attachment.formFile = {
          id: file.id,
          name: originalName,
          filepath: file.file
        };
        attachment.opAttachmentVersion.value.file = attachment.formFile
        this._saveOperationAttachment(attachment);
        return true;
      })
>>>>>>> cdm-dev
    } else {
      this.api.getOperationAttachmentById(attachment.id).subscribe(res =>{
        attachment.opAttachmentVersion.value.file = res.opAttachmentVersion.value.file;
        this._saveOperationAttachment(attachment);
        return true;
      });     
    }
  }

  removeAttachment(id: any) {
    // optimistic update
    const attachment = this.operationState.attachments.find(a => a.id === id);
    this.operationState.attachments = this.operationState.attachments.filter(a => a.id !== id);
    try {
<<<<<<< HEAD
      //TODO vimago what service?
      // this.api.deleteOperationAttachment(id).subscribe(response => {
      //   if(response.status !== 'ok') {
      //     throw new Error('Unable to delete attachment');
      //   }
      //   // this.toastr.success('Attachment remove.', 'Attachment removed');
      // });
=======
      this.api.deleteOperationAttachment(id).subscribe(response => {
        if (response.status !== 'ok') {
          throw new Error('Unable to delete attachment');
        }
        // this.toastr.success('Attachment remove.', 'Attachment removed');
      });
>>>>>>> cdm-dev
    } catch (e) {
      console.error(e);
      this.operationState.attachments = [...this.operationState.attachments, attachment];
    }
  }

  loadAttachments(operationId: number, route?: string) {
    this.routeState.processing = true;
    if (route) { this.routeState.route = route; }
    this.operationState.attachments = [];
    this._loadOperation(operationId).subscribe(() => {
<<<<<<< HEAD
      // TODO vimago what service?
      // this.api.getOperationAttachments(operationId).subscribe(response => {
      //   const opas = response.opAttachments;
      //   if(opas.length) {
      //     forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
      //     .subscribe(reports => {
      //       this.routeState.processing = false;
      //       this.operationState.attachments = reports.map((r, i) => {
      //         return buildAttachment(opas[i], r);
      //       }).sort((a, b) => (a.id > b.id) ? 1 : -1);
      //       this.routeState.processing = false;
      //     });
      //   } else {
      //     this.routeState.processing = false;
      //   }
      // });
=======
      this.api.getOperationAttachments(operationId).subscribe(response => {
        const opas = response.opAttachments;
        if (opas.length) {
          forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
            .subscribe(reports => {
              this.routeState.processing = false;
              this.operationState.attachments = reports.map((r, i) => {
                return buildAttachment(opas[i], r);
              }).sort((a, b) => (a.id > b.id) ? 1 : -1);
              this.routeState.processing = false;
            });
        } else {
          this.routeState.processing = false;
        }
      });
>>>>>>> cdm-dev
    })
  }

  loadEntityAttachments(entityId: number, includeReports: boolean = true) {
    this.routeState.processing = true;
    this.entityState.attachments = [];
<<<<<<< HEAD
    // TODO vimago what service?
    // this.api.getGoverningEntity(entityId, ['opAttachments'])
    // .subscribe(response => {
    //   const opas = response.opAttachments;
    //   if(includeReports) {
    //     forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
    //     .subscribe(reports => {
    //       this.entityState.attachments = reports.map((r, i) => {
    //         return buildAttachment(opas[i], r);
    //       });
    //       this.routeState.processing = false;
    //     });
    //   } else {
    //     this.entityState.attachments = opas.map(opa => buildAttachment(opa));
    //     this.routeState.processing = false;
    //   }
    // });
=======
    this.api.getGoverningEntity(entityId, ['opAttachments'])
      .subscribe(response => {
        const opas = response.opAttachments;
        if (includeReports) {
          forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
            .subscribe(reports => {
              this.entityState.attachments = reports.map((r, i) => {
                return buildAttachment(opas[i], r);
              });
              this.routeState.processing = false;
            });
        } else {
          this.entityState.attachments = opas.map(opa => buildAttachment(opa));
          this.routeState.processing = false;
        }
      });
>>>>>>> cdm-dev
  }

  loadEntities(entityPrototypeId: number, operationId?: number) {
    this.routeState.processing = true;
    this.operationState.entities = [];
    this._loadOperation(operationId || this.operationState.operation.id).subscribe(response => {
      const opep = response.opEntityPrototypes
        .find(p => p.id == entityPrototypeId);
      const x = buildEntityPrototype(opep);
      if (!this.entityState.prototype || this.entityState.prototype.id !== x.id) {
        this.entityState.prototype = x;
      }
      this.operationState.entities = response.opGoverningEntities
        .filter(ge => ge.opEntityPrototype.id == entityPrototypeId)
        .map(ge => buildEntity(ge, ge.opGoverningEntityVersion));
      this.routeState.processing = false;
    });
  }

  loadAttachmentPrototypes(operationId?: number) {
    this._loadOperation(operationId || this.operationState.operation.id)
      .subscribe(response => {
        this.operationState.attachmentPrototypes = response.opAttachmentPrototypes
          .map(ap => buildAttachmentPrototype(ap));
      });
  }


  loadEntityPrototypes(operationId?: number) {
    this._loadOperation(operationId || this.operationState.operation.id)
      .subscribe(response => {
        this.operationState.entityPrototypes = response.opEntityPrototypes
          .map(ep => buildEntityPrototype(ep));
      });
  }

  loadEntityPrototype(operationId: number, id: number) {
    this._loadOperation(operationId).subscribe(response => {
      const entityPrototype = response.opEntityPrototypes
        .filter(ep => ep.id === id);
      return entityPrototype ? entityPrototype[0] : null;
    });
  }

  _saveEntity(entity, activationFile, deactivationFile) {
    const xentity = this.formatter.formatDbEntity(entity, activationFile, deactivationFile);
    // TODO what service?
    // this.api.saveGoverningEntity(xentity).subscribe(() => {
    //   // if(entity.id) {
    //   //   this.toastr.success('Governing entity updated.', 'Governing entity updated');
    //   // } else {
    //   //   this.toastr.success('Governing entity create.', 'Governing entity created');
    //   // }
    //   this.loadEntities(this.entityState.prototype.id);
    //   this.routeState.mode = null;
    // });
  }

  addEntity(entity, oldEntity, operationId?: number) {
    const token = new Date().valueOf();
    const refCode = this.entityState.prototype.refCode;
    if (updatedFile(entity, oldEntity, 'activationLetter')) {
      let uid = `${refCode}A${token}${entity.activationLetter.name}`;
<<<<<<< HEAD
      // TODO vimago what service?
      // this.api.saveFile(entity.activationLetter, uid).subscribe(activationFile=> {
      //   if(entity.deactivationLetter && entity.deactivationLetter.name && !entity.deactivationLetter.id) {
      //     uid = `${refCode}D${token}${entity.deactivationLetter.name}`;
      //     this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
      //       this._saveEntity(entity, activationFile, deactivationFile);
      //     });
      //   } else {
      //     this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
      //   }
      // });
=======
      this.api.saveFile(entity.activationLetter, uid).subscribe(activationFile => {
        if (entity.deactivationLetter && entity.deactivationLetter.name && !entity.deactivationLetter.id) {
          uid = `${refCode}D${token}${entity.deactivationLetter.name}`;
          this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile => {
            this._saveEntity(entity, activationFile, deactivationFile);
          });
        } else {
          this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
        }
      });
>>>>>>> cdm-dev
    } else {
      if (updatedFile(entity, oldEntity, 'deactivationLetter')) {
        const uid = `${refCode}${token}${entity.deactivationLetter.name}`;
<<<<<<< HEAD
        // TODO vimago what service?
        // this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile=> {
        //   this._saveEntity(entity, entity.activationLetter, deactivationFile);
        // });
=======
        this.api.saveFile(entity.deactivationLetter, uid).subscribe(deactivationFile => {
          this._saveEntity(entity, entity.activationLetter, deactivationFile);
        });
>>>>>>> cdm-dev
      } else {
        this._saveEntity(entity, entity.activationLetter, entity.deactivationLetter);
      }
    }
  }

  removeEntity(entityId: number) {
    // TODO vimago what service?
    // this.api.deleteOperationGve(entityId).subscribe(() => {
    //   // this.toastr.success('Governing entity remove.', 'Governing entity removed');
    //   this.loadEntities(this.entityState.prototype.id, this.operationState.operation.id);
    //   this.entityState.entity = null;
    // })
  }

  _loadOperation(operationId: number): any {
    return from(new Promise(resolve => {
      this.ensureReportingWindowExists(operationId).subscribe(() => {
        // TODO vimago what service?
        // this.api.getOperation(operationId).subscribe(response => {
        //   this.operationState.operation = buildOperation(response);
        //   resolve(response);
        // });
      });
    }));
  }

  loadOperation(operationId: number): any {
    return from(new Promise(resolve => {
      // this.id = operationId;
      this.ensureReportingWindowExists(operationId).subscribe(() => {
        // TODO vimago what service?
        // this.api.getOperation(operationId).subscribe(response => {
        //   this.operationState.operation = buildOperation(response);
        //   resolve(this.operationState.operation);
        // });
      });
    }));
  }

  // TODO temporary hack to get around having a reporting window
  private ensureReportingWindowExists(operationId) {
    const p = new Promise(resolve => {
<<<<<<< HEAD
      // TODO vimago what service?
      // this.api.getReportingWindows(operationId).subscribe(rws => {
      //   const reportingWindow = rws.filter(rw => rw.operationId == operationId);
      //   if(reportingWindow.length > 0) {
      //     this.reportingWindow = reportingWindow[0];
      //     resolve();
      //   } else {
      //     this.api.saveReportingWindow({
      //       operationId,
      //       startDate: new Date(new Date().getFullYear(), 0, 1),
      //       endDate: new Date(new Date().getFullYear(), 11, 31),
      //       status: 'active'
      //     }).subscribe(response => {
      //       this.reportingWindow = response;
      //       resolve();
      //     })
      //   }
      // });
=======
      this.api.getReportingWindows(operationId).subscribe(rws => {
        const reportingWindow = rws.filter(rw => rw.operationId == operationId);
        if (reportingWindow.length > 0) {
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
>>>>>>> cdm-dev
    });
    return from(p);
  }
}

// TODO revisit this
// private checkPermissionOperation(operationId) {
//   if (!this.authService.participant) {
//     this.authService.fetchParticipant().subscribe(participant => {
//       if (participant && participant.roles) {
//         if (participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
//           return true;
//         }
//       }
//     });
//   } else {
//     if (this.authService.participant && this.authService.participant.roles) {
//       if (this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
//         return true;
//       }
//     }
//   }
//   let haveAccess = false;
//   if (this.authService.participant && this.authService.participant.roles) {
//     this.authService.participant.roles.forEach((role:any)=> {
//       role.participantRoles.forEach((pR:any)=> {
//         console.log(pR,operationId);
//         if (pR.objectType === 'operation' && pR.objectId === +operationId) {
//           haveAccess = true;
//         }
//       });
//     });
//   }
//   return haveAccess;
// }
// private checkPermissionGe(ge) {
//   ge.isEditable = false;
//   if (!this.authService.participant) {
//     this.authService.fetchParticipant().subscribe(participant => {
//       if (participant && participant.roles) {
//         if (participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
//           return true;
//         }
//       }
//     });
//   } else {
//     if (this.authService.participant && this.authService.participant.roles) {
//       if (this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin')) {
//         return true;
//       }
//     }
//   }
//   if (this.authService.participant && this.authService.participant.roles) {
//     this.authService.participant.roles.forEach((role:any)=> {
//       role.participantRoles.forEach((pR:any)=> {
//         if (pR.objectType === 'operation' && pR.objectId === this.operation.id) {
//           ge.isEditable = true;
//         }
//         if (pR.objectType === 'opGoverningEntity' && pR.objectId  === ge.id) {
//           ge.isEditable = true;
//         }
//       });
//     });
//   }
//   return ge.isEditable;
//   }
