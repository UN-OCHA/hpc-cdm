import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';
import { ExportService } from 'app/shared/services/export.service';
import { ToastrService } from 'ngx-toastr';
import { mergeMap, debounceTime } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-listparticipant',
  templateUrl: './listparticipant.component.html',
  styleUrls: ['./listparticipant.component.scss']
})
export class ListparticipantComponent implements OnInit {
  public participants: any[];
  public typeaheadPlanNoResults = false;
  public typeaheadRoleNoResults = false;
  public typeaheadClusterNoResults = false;
  public typeaheadOrganizationNoResults = false;
  public typeaheadParticipantNoResults = false;
  public enableCluster = false;
  public roles: any[];
  public plans: any[];
  public organizations: any[];
  public clusters: Observable<any>;
  public planDataSource: Observable<any>;
  public roleDataSource: Observable<any>;
  public clusterDataSource: Observable<any>;
  public organizationDataSource: Observable<any>;
  public participantDataSource: Observable<any>;
  public filterCriteria: any = { plan: '', role: '', cluster: '', organization: '', name: '' };
  public filterExpression: any = { plan: [], role: [], cluster: [], organization: [], email: [] };
  public isEnableSearchPanel = false;
  constructor(public apiService: ApiService, private toastr: ToastrService,
    private exportService: ExportService) {
  }
  ngOnInit() {
    this.planDataSource = Observable
      .create((observer: any) => observer.next(this.filterCriteria.plan))
      .pipe(debounceTime(1000), mergeMap((searchKey: string) => this.apiService.autocompletePlan(searchKey)));
    this.roleDataSource = Observable
      .create((observer: any) => observer.next(this.filterCriteria.role))
      .pipe(mergeMap((searchKey: string) => this.autocompleteRole(searchKey)));
    this.clusterDataSource = Observable
      .create((observer: any) => observer.next(this.filterCriteria.cluster))
      .pipe(mergeMap((searchKey: string) => this.autocompleteCluster(searchKey)));
    this.organizationDataSource = Observable
      .create((observer: any) => observer.next(this.filterCriteria.organization))
      .pipe(debounceTime(1000), mergeMap((searchKey: string) => this.apiService.autocompleteOrganization(searchKey)));
    this.participantDataSource = Observable
      .create((observer: any) => observer.next(this.filterCriteria.name))
      .pipe(mergeMap((searchKey: string) => this.autocompleteParticipant(searchKey)));
    this.apiService.getAllRoles().subscribe(roles => {
      this.roles = roles;
    });
    this.GetParticipants();
  }
  public autocompleteRole(searchKey: string): Observable<any> {
    if (searchKey === '') return of(this.roles);
    return this.roles != null ? of(this.roles.filter(e => e.name.indexOf(searchKey) !== -1)) : null;
  }
  public autocompleteCluster(searchKey: string): Observable<any> {
    if (searchKey === '') return of(this.clusters);
    return this.clusters != null ? of(this.clusters.filter(e =>
      e.governingEntityVersion.name.toUpperCase().indexOf(searchKey.toUpperCase()) !== -1)) : null;
  }
  public autocompleteParticipant(searchKey: string): Observable<any> {
    if (searchKey === '') return of(this.participants);

    return this.participants != null ? of(this.participants.filter(e =>
      (e.hidId && e.hidId.toUpperCase().startsWith(searchKey.toUpperCase())) ||
      (e.email && e.email.toUpperCase().startsWith(searchKey.toUpperCase())))) : null;
  }
  public getAllParticipants(searchKey: string): Observable<any> {
    return this.participants != null ? of(this.participants.filter(e => e.name_given.toUpperCase().startsWith(searchKey.toUpperCase())
      || e.name_family.toUpperCase().startsWith(searchKey.toUpperCase()))) : null;

  }
  private filterByEmail(e): boolean {
    return ((e.email && this.filterExpression.email.filter(n => n.email.toUpperCase()
      .indexOf(e.email.toUpperCase()) !== -1).length > 0) || (e.hidId && this.filterExpression.email
        .filter(n => n.email.toUpperCase().indexOf(e.hidId.toUpperCase()) !== -1).length > 0))
  }

  private filterByOrganization(org): boolean {
    return org.organizations != null &&
      org.organizations.length > 0 && org.organizations
        .filter(e => this.filterExpression.organization.filter(o => o.id === e.id).length > 0).length > 0;
  }

  private filterByPlanorCluster(plan, type): boolean {
    const filterList = type === 'plan' ? this.filterExpression.plan : this.filterExpression.cluster;
    return plan.roles != null &&
      plan.roles.length > 0 && plan.roles
        .filter(e => e.participantRoles.filter(r => r.objectId != null && r.objectType != null
          && r.objectType === type && filterList.filter(p => p.id === r.objectId).length > 0).length > 0).length > 0;
  }

  private filterByRole(role): boolean {
    return role.roles != null &&
      role.roles.length > 0 && role.roles
        .filter(e => this.filterExpression.role.filter(r => r.id === e.id).length > 0).length > 0;
  }
  public GetParticipants() {
    this.apiService.getAllParticipants().subscribe(res => {
      this.participants = res;
      console.log(this.participants);
      this.participants = this.participants.filter(e =>
        (this.filterExpression.email.length > 0 && this.filterByEmail(e)) ||
        (this.filterExpression.organization.length > 0 && this.filterByOrganization(e)) ||
        (this.filterExpression.plan.length > 0 && this.filterByPlanorCluster(e, 'plan')) ||
        (this.filterExpression.role.length > 0 && this.filterByRole(e)) ||
        (this.filterExpression.cluster.length > 0 && this.filterByPlanorCluster(e, 'governingEntity')) ||
        (this.filterExpression.email.length === 0 && this.filterExpression.organization.length === 0 &&
          this.filterExpression.plan.length === 0 && this.filterExpression.role.length === 0 &&
          this.filterExpression.cluster.length === 0 && (1 === 1)));
    });
  }
  public GetRolesList(roles): String {
    return Array.prototype.map.call(roles, s => s.description).toString();
  }
  public BindGlobalEntity(planId) {
    this.apiService.getGlobalClustersByPlan(planId).subscribe(res => {
      this.clusters = res;
      this.enableCluster = true;
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
      console.log(response);
    })
  }

  public ExportToXLS() {
    const headers = ['Id',
      'First Name',
      'Family Name',
      'Email',
      'HidId',
      'Roles'
    ];
    const exportedData = this.participants.map(participant => {
      return {
        id: participant.id,
        name_given: participant.name_given,
        name_family: participant.name_family,
        email: participant.email,
        hidId: participant.hidId,
        roles: this.GetRolesList(participant.roles)
      }
    });
    const data = this.exportService.turnArrayOfObjectsIntoArrayOfArrays(exportedData, null, headers);
    this.exportService.exportData([data], `participant.xlsx`);
  }
  public clearFilters(type) {
    if (type) {
      this.filterExpression[type] = [];
      if (this.filterExpression.plan.length === 0 && this.filterExpression.role.length === 0 &&
        this.filterExpression.cluster.length === 0 && this.filterExpression.organization.length === 0
        && this.filterExpression.email.length === 0) {
        this.isEnableSearchPanel = false;
      }
      this.enableCluster = this.filterExpression.plan.length > 0;
    } else {
      this.filterExpression = { plan: [], role: [], cluster: [], organization: [], email: [] };
      this.filterCriteria.name = '';
      this.enableCluster = false;
      this.isEnableSearchPanel = false;
    }
  }
  public typeaheadOnSelectPlan(e: TypeaheadMatch) {
    this.filterExpression.plan.push({ 'id': e.item.id, 'name': e.item.name });
    this.BindGlobalEntity(e.item.id)
    this.filterCriteria.plan = '';
    this.isEnableSearchPanel = true;
  }
  public typeaheadOnSelectCluster(e: TypeaheadMatch) {
    this.filterExpression.cluster.push({ 'id': e.item.id, 'name': e.item.governingEntityVersion.name });
    this.filterCriteria.cluster = '';
    this.isEnableSearchPanel = true;
  }
  public typeaheadOnSelectRole(e: TypeaheadMatch) {
    this.filterExpression.role.push({ 'id': e.item.id, 'name': e.item.description });
    this.filterCriteria.role = '';
    this.isEnableSearchPanel = true;
  }
  public typeaheadOnSelectOrganization(e: TypeaheadMatch) {
    this.filterExpression.organization.push({ 'id': e.item.id, 'name': e.item.name });
    this.filterCriteria.organization = '';
    this.isEnableSearchPanel = true;
  }
  public typeaheadOnSelectParticipants(e: TypeaheadMatch) {
    this.filterExpression.email.push({ 'email': e.item.email });
    this.filterCriteria.name = '';
    this.isEnableSearchPanel = true;
  }
  public changeTypeaheadPlanNoResults(e: boolean) {
    this.typeaheadPlanNoResults = e;
  }
  public changeTypeaheadRoleNoResults(e: boolean) {
    this.typeaheadRoleNoResults = e;
  }
  public changeTypeaheadClusterNoResults(e: boolean) {
    this.typeaheadClusterNoResults = e;
  }
  public changeTypeaheadOrganizationNoResults(e: boolean) {
    this.typeaheadOrganizationNoResults = e;
  }
  public changeTypeaheadPartcipantNoResults(e: boolean) {
    this.typeaheadParticipantNoResults = e;
  }
  public GetNames(arr): string {
    let res = '';
    arr.forEach(e => {
      res = res + (e.name !== undefined ? `${e.name},` : `${e.email},`);
    });
    return res;
  }
}
