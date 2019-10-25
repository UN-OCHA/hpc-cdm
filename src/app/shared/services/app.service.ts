import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';
import { Operation } from './operation/operation.models';
import { buildOperation } from './operation/operation.builders';


@Injectable({providedIn: 'root'})
export class AppService {

  private readonly _operations = new BehaviorSubject<Operation[]>([]);
  readonly operations$ = this._operations.asObservable();

  constructor(private api: ApiService){}

  get operations(): Operation[] { return this._operations.getValue(); }
  set operations(val: Operation[]) { this._operations.next(val); }

  loadOperations(): void {
    const options = { scopes: 'entityPrototypes,operationVersion' };
    this.api.getOperations(options).subscribe(operations => {
      this.operations = operations.map(o => buildOperation(o));
    });
  }
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
