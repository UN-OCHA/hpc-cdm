import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService } from 'app/shared/services/api/api.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
})
export class MapWrapperComponent implements OnInit {

  public loading = false;

  public isAdmin: boolean | any = false;

  public currentPage = 1;
  public page = [];

  public options: any;
  public searchOptions: any;

  public cdmResults: any;

  typeaheadNoResults = false;
  working = false;

  public hideMap = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {

    this.cdmResults = [];
    this.working = true;

    let options = { scopes: 'entityPrototypes,operationVersion,attachments'};

    this.searchOptions = options;

    this.loading = true;

    if (!this.authService.participant) {
      this.authService.fetchParticipant().subscribe(participant => {
        if (participant && participant.roles) {
          this.isAdmin = participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin');
        }
      });
    } else {
      if (this.authService.participant && this.authService.participant.roles) {
        this.isAdmin = this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin');
      }
    }

    this.apiService.getOperations(options)
      .subscribe(results => {
        this.cdmResults = this.processSearchResults(results);
        this.loading = false;
        this.page = this.cdmResults.slice(0,10);
        this.working = false;
      });
  }

  private processSearchResults (results:any) {
    if (this.isAdmin) {
      return results;
    } else {
      const authorizedOperations = [];
      if (this.authService.participant && this.authService.participant.roles) {
        results.forEach((operation:any) => {
          this.apiService.getPermittedActionsForOperation(operation.id).subscribe(permittedActions=> {
            operation.permittedActions = permittedActions;
          });
          this.authService.participant.roles.forEach((role:any)=> {
            role.participantRoles.forEach((pR:any)=> {
              if (pR.objectType === 'operation' && pR.objectId === operation.id) {
                  operation.isOperationLead = true;
                  authorizedOperations.push(operation);
              }

              console.log(operation,pR);
              if (pR.objectType === 'opGoverningEntity' && operation.opGoverningEntities && operation.opGoverningEntities.length &&  operation.opGoverningEntities.filter(gE => gE.id === pR.objectId).length) {
                  operation.opGoverningEntities.filter(gE => gE.id === pR.objectId)[0].isEditable = true;
                  operation.isGoverningEntityLead = true;
                  authorizedOperations.push(operation);
              }
            });
          });
        });
      }
      console.log(authorizedOperations);
      return authorizedOperations;
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.page = this.cdmResults.slice(startItem, endItem);
  }

}
