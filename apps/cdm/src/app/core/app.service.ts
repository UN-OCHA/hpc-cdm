import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, ApiService } from '@hpc/core';
import { User, Operation, buildOperation, buildUser } from '@hpc/data';


@Injectable({providedIn: 'root'})
export class AppService {

  private readonly _operations = new BehaviorSubject<Operation[]>([]);
  readonly operations$ = this._operations.asObservable();

  // private readonly _user = new BehaviorSubject<User>(null);
  // readonly user$ = this._user.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private translate: TranslateService){}

  get language() { return this.translate.currentLang.toUpperCase(); }
  set language(val: any) { this.translate.use(val); }

  get operations(): Operation[] { return this._operations.getValue(); }
  set operations(val: Operation[]) { this._operations.next(val); }

  // get user(): User { return this._user.getValue(); }
  // set user(val: User) { this._user.next(val); }

  loadDefaultLanguage(): void {
    this.translate.setDefaultLang('en');
    this.translate.use(this.translate.getBrowserLang() || 'en');
  }

  loadOperations(): void {
    console.log('Loading operations==============================1')
    const options = { scopes: 'entityPrototypes,operationVersion' };
    this.api.getOperations(options).subscribe(operations => {
      this.operations = operations.map(o => buildOperation(o));
    });
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
