import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/shared/services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { mergeMap, debounceTime } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
@Component({
  selector: 'app-editparticipant',
  templateUrl: './editparticipant.component.html',
  styleUrls: ['./editparticipant.component.scss']
})
export class EditparticipantComponent implements OnInit {
  public participant: any = {
    email: '',
    hidId: '',
    name_given: '',
    name_family: '',
    partcipantRoles: []
  };
  public roles: any[];
  public locations: any[];
  public cachedplans: any[];
  public governingEntities: any[];
  public selectedCountry: string;
  public selectedOrganization: string;
  public selectedCountryName: string;
  public selectedOrganizationName: string;
  public selectedPlanName: string;
  public selectedPlanId: string;
  public selectedRole: string
  public planDataSource: Observable<any>;
  public organizationDataSource: Observable<any>;
  public locationDataSource: Observable<any>;
  public roleDataSource: Observable<any>;
  public entityDataSource: Observable<any>;
  public typeaheadPlanNoResults = false;
  public selectedRoleName = '';
  public hasPlanAccess = false;
  public hasClusterAccess = false;
  public selectedEntity: string;
  public selectedEntityName: string;
  public typeaheadOrganizationNoResults = false;
  public typeaheadLocationNoResults = false;
  public typeaheadRoleNoResults = false;
  public typeaheadEntityeNoResults = false;
  public selectedTab = 'profile';
  constructor(public apiService: ApiService, private route: ActivatedRoute, private toastr: ToastrService) {
    this.planDataSource = Observable
      .create((observer: any) => observer.next(this.selectedPlanName))
      .pipe(mergeMap((searchKey: string) => this.getAllPlans(searchKey)));
    this.organizationDataSource = Observable
      .create((observer: any) => observer.next(this.selectedOrganizationName))
      .pipe(debounceTime(1000), mergeMap((searchKey: string) => this.apiService.autocompleteOrganization(searchKey)));
    this.locationDataSource = Observable
      .create((observer: any) => observer.next(this.selectedCountryName))
      .pipe(debounceTime(1000), mergeMap((token: string) => this.apiService.autocompleteLocation(token)));
    this.roleDataSource = Observable
      .create((observer: any) => observer.next(this.selectedRoleName))
      .pipe(mergeMap((searchKey: string) =>  this.autocompleteRole(searchKey)));
    this.entityDataSource = Observable
      .create((observer: any) => observer.next(this.selectedEntityName))
      .pipe(mergeMap((searchKey: string) =>  this.autocompleteEntity(searchKey)));
  }

  ngOnInit() {
    this.getPlans();
    if (this.cachedplans && this.cachedplans.length > 0) {
      this.getParticipantById();
    }
    this.apiService.getAllRoles().subscribe(roles => {
      this.roles = roles;
    });
   this.apiService.getLocations().subscribe(res => {
      this.locations = res;
    })
  }
  public autocompleteRole(searchKey: string): Observable<any> {
    if (searchKey === '') return of(this.roles);
    return  this.roles != null ? of(this.roles.filter(e => e.name.indexOf(searchKey) !== -1)) : null;
  }
  public autocompleteEntity(searchKey: string): Observable<any> {
    if (searchKey === '') return of(this.governingEntities);
    return  this.governingEntities != null ? of(this.governingEntities.filter(e =>
       e.governingEntityVersion.name.toUpperCase().indexOf(searchKey.toUpperCase()) !== -1)) : null;
  }
  private getPlans(): any[] {
    if (this.cachedplans) {
      return this.cachedplans;
    } else {
      this.apiService.getAllPlans().subscribe(res => {
        this.cachedplans = res;
        this.getParticipantById();
        return res;
      })
    }
  }

  public getAllPlans(searchKey: string): Observable<any> {
    return this.cachedplans != null ? of(this.cachedplans
      .filter(e => e.planVersion.name.toUpperCase().startsWith(searchKey.toUpperCase()))) : null;
  }
  private parseParticipantData(participants): any[] {
    const partcipantRolesList: any[] = [];
    participants.roles.forEach(role => {
      if (role && role.participantRoles) {
        role.participantRoles.forEach(participantRole => {
          const participantRoleItem: any = {};
          participantRoleItem.id = participantRole.id;
          participantRoleItem.description = role.description;
          if (participantRole && participantRole.objectType === 'plan') {
            participantRoleItem.planId = participantRole.objectId;
            this.cachedplans.forEach(function (plan) {
              if (plan && plan.id === participantRole.objectId) {
                participantRoleItem.planName = plan.planVersion.name;
                participantRoleItem.clusterName = '';
                partcipantRolesList.push(participantRoleItem);
              }
            });
          } else if (participantRole && participantRole.objectType === 'governingEntity') {
            participantRoleItem.clusterId = participantRole.objectId;
            this.apiService.getgoveningEntityById(participantRoleItem.clusterId).subscribe(governingEntity => {
              this.cachedplans.forEach(function (plan) {
                if (plan && plan.id === governingEntity.planId) {
                  participantRoleItem.planName = plan.planVersion.name;
                }
              });
              participantRoleItem.clusterName = governingEntity.governingEntityVersion.name;
              partcipantRolesList.push(participantRoleItem);
            });
          } else {
            partcipantRolesList.push(participantRoleItem);
          }

        });
      }
    });
    return partcipantRolesList;
  }

  private getParticipantById() {
    this.apiService.getParticipantById(this.route.snapshot.params.id).subscribe(res => {
      this.participant = res;
      this.participant.participantRoles = this.parseParticipantData(res);
    });
  }

  selectCountryChange(e) {
    this.selectedCountry = e.item.id;
  }
  selectedEntityChange(e) {
    this.selectedEntity = e.item.id;
  }

  selectOrganizationChange(e) {
    this.selectedOrganization = e.item.id;
  }

  selectRoleChange(e) {
    this.selectedRole = e.item.id;
    this.hasPlanAccess = false;
    this.hasClusterAccess = false;
    this.selectedEntity = '';
    this.selectedPlanId = '';
    this.selectedPlanName = '';
    this.selectedEntityName = '';
    this.hasPlanAccess = this.selectedRoleName === 'Plan Lead' || this.selectedRoleName === 'Read Only'
      || this.selectedRoleName === 'Cluster Lead' ? true : false;
  }

  public addParticipantCountry() {
    const participant = {
      id: this.route.snapshot.params.id
    }
    const country = {
      id: this.selectedCountry
    }
    return this.apiService.saveParticipantCountry(participant, country)
      .subscribe(response => {
        const countryItem: any = {
          id: this.selectedCountry,
          name: this.selectedCountryName,
          participantCountry: {
            validated: false,
            id: response.data.id
          }
        }
        this.participant.locations.push(countryItem);
        this.selectedCountry = '';
        this.selectedCountryName = '';
        return this.toastr.success('Country added.', 'Account updated');
      });
  }

  public deleteParticipantCountry(country) {
    const participant = {
      id: this.route.snapshot.params.id
    }
    return this.apiService.deleteParticipantCountry(participant, country.participantCountry.id)
      .subscribe(response => {
        this.participant.locations.splice(this.participant.locations.indexOf(country), 1);
        return this.toastr.success('Country removed.', 'Account updated');
      });
  }

  public deleteParticipantOrganization(organization) {
    const participant = {
      id: this.route.snapshot.params.id
    }
    return this.apiService.deleteParticipantOrganization(participant, organization.participantOrganization.id)
      .subscribe(response => {
        this.participant.organizations.splice(this.participant.organizations.indexOf(organization), 1);
        return this.toastr.success('Organization removed.', 'Account updated');
      });
  }

  public deleteParticipantRole(role) {
    const participant = {
      id: this.route.snapshot.params.id
    }
    return this.apiService.deleteParticipantRole(participant, role.id)
      .subscribe(response => {
        this.participant.participantRoles.splice(this.participant.participantRoles.indexOf(role), 1);
        return this.toastr.success('Role removed.', 'Account updated');
      });
  }

  public addParticipantOranization() {
    const participant = {
      id: this.route.snapshot.params.id,
      organizations: []
    }
    const organization = {
      id: this.selectedOrganization
    }
    return this.apiService.saveParticipantOrganization(participant, organization)
      .subscribe(response => {
        const organizationItem: any = {
          id: this.selectedOrganization,
          name: this.selectedOrganizationName,
          participantOrganization: {
            validated: false,
            id: response.data.id
          }
        }
        this.participant.organizations.push(organizationItem);
        this.selectedOrganization = '';
        this.selectedOrganizationName = '';
        return this.toastr.success('Organization added.', 'Account updated');
      });
  }

  public addParticipantRole() {
    const participantRole: any = {
      roleId: parseInt(this.selectedRole),
      participantId: this.route.snapshot.params.id,
      objectId: this.hasClusterAccess ? this.selectedEntity : this.hasPlanAccess ? this.selectedPlanId : undefined,
      objectType: this.hasClusterAccess ? 'governingEntity' : this.hasPlanAccess ? 'plan' : undefined
    }
    this.apiService.saveParticipantRole(participantRole).subscribe(res => {
      const participantRoleItem: any = {
        id: res.data.id,
        description: this.selectedRoleName,
        planId: this.selectedPlanId,
        planName: this.selectedPlanName,
        clusterName: this.selectedEntityName
      }
      this.participant.participantRoles.push(participantRoleItem);
      this.selectedRole = '';
      this.selectedPlanId = '';
      this.selectedPlanName = '';
      this.selectedEntityName = '';
      this.selectedRoleName = '';
      this.hasClusterAccess = false;
      this.hasPlanAccess = false;
      this.selectedEntity = '';
      return this.toastr.success('Role saved.', 'Account updated');
    })
  }

  public updateOrgnizationStatus(organization) {
    organization.participantOrganization.validated = !organization.participantOrganization.validated;
    this.apiService.updateParticipantOrganization(organization.participantOrganization).subscribe(response => {
      this.toastr.success('Organization validated.', 'Success!!!');
    })
  }

  public updateCountryStatus(country) {
    country.participantCountry.validated = !country.participantCountry.validated;
    this.apiService.updateParticipantCountry(country.participantCountry).subscribe(response => {
      this.toastr.success('Country validated.', 'Success!!!');
    })
  }

  public updateParticipant() {
    this.apiService.saveParticipant(this.participant).subscribe(response => {
      this.toastr.success('Particpant Updated', 'Success!!!');
    })
  }

  public changeTypeaheadPlanNoResults(e: boolean) {
    this.typeaheadPlanNoResults = e;
  }

  public typeaheadOnSelectPlan(e: TypeaheadMatch) {
    this.selectedPlanId = e.item.id;
    if (this.selectedRoleName === 'Cluster Lead' || this.selectedRoleName === 'Read Only') {
      this.apiService.getGlobalClustersByPlan(e.item.id).subscribe(res => {
        this.governingEntities = res;
        this.hasClusterAccess = true;
      });
    }
  }
  public changeTypeaheadOrganizationNoResults(e: boolean) {
    this.typeaheadOrganizationNoResults = e;
  }
  public changeTypeaheadLocationNoResults(e: boolean) {
    this.typeaheadLocationNoResults = e;
  }
  public changeTypeaheadRoleNoResults(e: boolean) {
    this.typeaheadRoleNoResults = e;
  }
  public changeTypeaheadEntityNoResults(e: boolean) {
    this.typeaheadEntityeNoResults = e;
  }
  public setTab(tab: any) {
    this.selectedTab = tab;
  }
}
