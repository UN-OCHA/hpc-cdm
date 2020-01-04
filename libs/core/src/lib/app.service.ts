import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map, filter, shareReplay } from 'rxjs/operators';
// import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api';
import {
  User, Operation, Blueprint, AttachmentPrototype, EntityPrototype,
  Attachment, Participant, Entity, ReportingWindow,
  buildEntityPrototype, buildAttachmentPrototype, buildLocation,
  buildAttachment, buildEntity, buildReportingWindow,
  buildOperation, buildBlueprint, buildUser } from '@hpc/data';

@Injectable({providedIn: 'root'})
export class AppService {

  private readonly _operations = new BehaviorSubject<Operation[]>([]);
  readonly operations$ = this._operations.asObservable();

  private readonly _blueprints = new BehaviorSubject<Blueprint[]>([]);
  readonly blueprints$ = this._blueprints.asObservable();

  private readonly _participants = new BehaviorSubject<Participant[]>([]);
  readonly participants$ = this._participants.asObservable();

  private readonly _operationAttachments = new BehaviorSubject<Attachment[]>([]);
  readonly operationAttachments$ = this._operationAttachments.asObservable();

  private readonly _reportingWindows = new BehaviorSubject<ReportingWindow[]>([]);
  readonly reportingWindows$ = this._reportingWindows.asObservable();

  private readonly _entities = new BehaviorSubject<Entity[]>([]);
  readonly entities$ = this._entities.asObservable();

  private readonly _selectedOperationId = new BehaviorSubject<number>(null);
  private readonly _selectedBlueprintId = new BehaviorSubject<number>(null);
  private readonly _selectedAttachmentPrototypeId = new BehaviorSubject<number>(null);
  private readonly _selectedEntityPrototypeId = new BehaviorSubject<number>(null);
  private readonly _selectedAttachmentId = new BehaviorSubject<number>(null);
  private readonly _selectedEntityId = new BehaviorSubject<number>(null);
  private readonly _selectedReportingWindowId = new BehaviorSubject<number>(null);

  private readonly _entityPrototypes = new BehaviorSubject<EntityPrototype[]>([]);
  readonly entityPrototypes$ = this._entityPrototypes.asObservable();

  private readonly _attachmentPrototypes = new BehaviorSubject<AttachmentPrototype[]>([]);
  readonly attachmentPrototypes$ = this._attachmentPrototypes.asObservable();

  private readonly _locations = new BehaviorSubject<Location[]>([]);
  readonly locations$ = this._locations.asObservable();

  private readonly _emergencies = new BehaviorSubject<Location[]>([]);
  readonly emergencies$ = this._emergencies.asObservable();

  operation$ = this._selectedOperationId.pipe(
    filter(Boolean),
    switchMap(id => this.getOperation(id)),
    shareReplay(1)
  );

  blueprint$ = this._selectedBlueprintId.pipe(
    filter(Boolean),
    switchMap(id => this.getBlueprint(id)),
    shareReplay(1)
  );

  attachmentPrototype$ = this._selectedAttachmentPrototypeId.pipe(
    filter(Boolean),
    switchMap(id => this.getAttachmentPrototype(id)),
    shareReplay(1)
  );

  entityPrototype$ = this._selectedEntityPrototypeId.pipe(
    filter(Boolean),
    switchMap(id => this.getEntityPrototype(id)),
    shareReplay(1)
  );

  reportingWindow$ = this._selectedReportingWindowId.pipe(
    filter(Boolean),
    switchMap(id => this.getReportingWindow(id)),
    shareReplay(1)
  );

  // private readonly _user = new BehaviorSubject<User>(null);
  // readonly user$ = this._user.asObservable();

  constructor(
    private api: ApiService,
    // private auth: AuthService,
    // private translate: TranslateService
  ){}

  // get language() { return this.translate.currentLang.toUpperCase(); }
  // set language(val: any) { this.translate.use(val); }

  get operations(): Operation[] { return this._operations.getValue(); }
  set operations(val: Operation[]) { this._operations.next(val); }

  get blueprints(): Blueprint[] { return this._blueprints.getValue(); }
  set blueprints(val: Blueprint[]) { this._blueprints.next(val); }

  get entityPrototypes(): EntityPrototype[] { return this._entityPrototypes.getValue(); }
  set entityPrototypes(val: EntityPrototype[]) { this._entityPrototypes.next(val); }

  // get user(): User { return this._user.getValue(); }
  // set user(val: User) { this._user.next(val); }

  loadDefaultLanguage(): void {
    // this.translate.setDefaultLang('en');
    // this.translate.use(this.translate.getBrowserLang() || 'en');
  }

  loadOperations(): void {
    const options = { scopes: 'entityPrototypes,operationVersion' };
    this.api.getOperations(options).subscribe(operations => {
      this.operations = operations.map(o => buildOperation(o));
    });
  }

  loadOperation(id: number): void { this._selectedOperationId.next(id); }
  loadBlueprint(id: number): void { this._selectedBlueprintId.next(id); }
  loadAttachmentPrototype(id: number): void {
    this._selectedAttachmentPrototypeId.next(id);
  }
  loadEntityPrototype(id: number): void {
    this._selectedEntityPrototypeId.next(id);
  }
  loadReportingWindow(reportingWindowId: number): void {
    this._selectedReportingWindowId.next(reportingWindowId);
  }


  loadBlueprints(): void {
    this.api.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints.map(bp => buildBlueprint(bp));
    });
  }

  loadAttachments(operationId: number): void {
    console.log(operationId)
    this.api.getOperationAttachments(operationId).subscribe(opas => {
      console.log(opas)
      const attachments = opas.opAttachments.map(opa => buildAttachment);
      this._operationAttachments.next(attachments);
    })
    // .subscribe(response => {
    //   const opas = response.opAttachments;
    //   if(opas.length) {
    //     forkJoin(opas.map(a => this.api.getReport(a.id, this.reportingWindow.id)))
    //     .subscribe(reports => {
    //       // this.routeState.processing = false;
    //       this.operationState.attachments = reports.map((r, i) => {
    //         return buildAttachment(opas[i], r);
    //       }).sort((a, b) => (a.id > b.id) ? 1 : -1);
    //       // this.routeState.processing = false;
    //     });
    //   } else {
    //     // this.routeState.processing = false;
    //   }
    // });
  }

  loadEntities(operationId: number, entityPrototypeId: number): void {
    this._selectedEntityPrototypeId.next(entityPrototypeId);
    this.api.getOperation(operationId).subscribe(response => {
      console.log(response)
      const opep = response.opEntityPrototypes.find(p => p.id == entityPrototypeId);
      this.entityPrototype$ = of(buildEntityPrototype(opep));
      this._entities.next(response.opGoverningEntities
        .filter(ge => ge.opEntityPrototype.id == entityPrototypeId)
        .map(ge => buildEntity(ge, ge.opGoverningEntityVersion)));
    });
  }

  loadAttachmentPrototypes(operationId: number): void {
    this.loadOperation(operationId);
  }

  loadEntityPrototypes(operationId: number): void {
    this.loadOperation(operationId);
  }

  loadParticipants(operationId: number): void {

  }

  loadEmergenciesAndLocations(): void {
    this.api.getLocations().subscribe(locations => {
      this._locations.next(locations.map(l => buildLocation(l)));
    });
    this.api.getLocations().subscribe(emergencies => {
      this._emergencies.next(emergencies.map(e => buildLocation(e)));
    })
  }

  loadReportingWindows(): void {
    this.api.getAllReportingWindows().subscribe(response => {
      console.log(response[0])
      this._reportingWindows.next(response.map(r => buildReportingWindow(r)));
    });
  }

  deleteBlueprint(id: number): void {
    this.api.deleteBlueprint(id).subscribe(() => {
      this.loadBlueprints();
    });
  }

  private getOperation(id: number): Observable<Operation> {
    return this.api.getOperation(id).pipe(map(op => {
      const v = op.operationVersion;
      let aprototypes = []
      if(op.opAttachmentPrototypes) {
        aprototypes = op.opAttachmentPrototypes.map(p => buildAttachmentPrototype(p))
        this._attachmentPrototypes.next(aprototypes);
      }
      this._entityPrototypes.next(op.opEntityPrototypes.map(p => buildEntityPrototype(p, aprototypes)));
      return buildOperation(op);
    }));
  }

  private getBlueprint(id: number): Observable<Blueprint> {
    return this.api.getBlueprint(id).pipe(map(bp => {
      return buildBlueprint(bp);
    }))
  }

  private getAttachmentPrototype(id: number): Observable<AttachmentPrototype> {
    return this.api.getAttachmentPrototype(id).pipe(map(ap => {
      return buildAttachmentPrototype(ap);
    }));
  }

  private getEntityPrototype(id: number): Observable<EntityPrototype> {
    return this.api.getEntityPrototype(id).pipe(map(ep => {
      return buildEntityPrototype(ep);
    }));
  }

  private getReportingWindow(id: number): Observable<ReportingWindow> {
    return this.api.getReportingWindow(id).pipe(map(rw => {
      return buildReportingWindow(rw);
    }));
  }

  // loadUser(): void {
  //   console.log('11111111111111111')
  //   this.auth.fetchParticipant().subscribe(participant => {
  //     console.log(participant)
  //     if(participant.user && this.auth.user != undefined) {
  //       this.user = buildUser(participant);
  //     } else {
  //       this.user = null;
  //     }
  //   });
  // }
}

//  TODO revisit this to possible filter using the api instead.
// let options = { scopes: 'entityPrototypes,operationVersion,attachments'};
// this.searchOptions = options;
// this.apiService.getOperations(options)
//   .subscribe(results => {
//     this.cdmResults = this.processSearchResults(results);
//     this.loading = false;
//     this.page = this.cdmResults.slice(0,10);
//     this.working = false;
//   });
//
// private processSearchResults (results:any) {
//   if (this.isAdmin) {
//     return results;
//   } else {
//     const authorizedOperations = [];
//     if (this.authService.participant && this.authService.participant.roles) {
//       results.forEach((operation:any) => {
//         /*this.apiService.getPermittedActionsForOperation(operation.id).subscribe(permittedActions=> {
//           operation.permittedActions = permittedActions;
//         });*/
//         this.authService.participant.roles.forEach((role:any)=> {
//           role.participantRoles.forEach((pR:any)=> {
//             if (pR.objectType === 'operation' && pR.objectId === operation.id) {
//                 operation.isOperationLead = true;
//                 authorizedOperations.push(operation);
//             }
//
//             if (pR.objectType === 'opGoverningEntity' && operation.opGoverningEntities && operation.opGoverningEntities.length &&  operation.opGoverningEntities.filter(gE => gE.id === pR.objectId).length) {
//                 operation.opGoverningEntities.filter(gE => gE.id === pR.objectId)[0].isEditable = true;
//                 operation.isGoverningEntityLead = true;
//                 authorizedOperations.push(operation);
//             }
//           });
//         });
//       });
//     }
//     return authorizedOperations;
//   }
// }
//
// pageChanged(event: PageChangedEvent): void {
//   const startItem = (event.page - 1) * event.itemsPerPage;
//   const endItem = event.page * event.itemsPerPage;
//   this.page = this.cdmResults.slice(startItem, endItem);
// }
