import { Component, OnInit } from '@angular/core';
import { Observable,of } from 'rxjs';
import { mergeMap} from 'rxjs/operators';
import { ApiService } from 'app/shared/services/api/api.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-participant-organizationand-country',
  templateUrl: './admin-participant-organizationand-country.component.html',
  styleUrls: ['./admin-participant-organizationand-country.component.scss']
})
export class AdminParticipantOrganizationandCountryComponent implements OnInit {
public participants:any[];
  public selectedOrganizationName = '';
  public dataSource: Observable<any>;
  public typeaheadLoading: boolean;
  public organizations: any;
  public countries: any;
  public typeaheadParticipantNoResults = false;
  public dataLoaded=false;

  constructor(private apiService: ApiService, private toastr: ToastrService, ) {
    this.apiService.getAllParticipants().subscribe(res =>{
      this.participants=res;  
      this.dataLoaded=this.participants.length > 0;       
     });

    this.dataSource = Observable
    .create((observer: any) => observer.next(this.selectedOrganizationName))
    .pipe(mergeMap((searchKey:string) =>  this.getAllParticipants(searchKey)));
  }

  ngOnInit() {    
  }

  public getAllParticipants(searchKey:string): Observable<any> {
      return  this.participants !=null ? of(this.participants.filter(e=>e.name_given.startsWith(searchKey)
          || e.name_family.startsWith(searchKey))) : null;
       
  }


  public typeaheadOnSelectParticipant(e: TypeaheadMatch) {
    this.selectedOrganizationName=`${e.item.name_given} ${e.item.name_family}`
    let participantInfo=this.participants.filter(o=>o.id === e.item.id);
      this.organizations = participantInfo.length > 0 ? participantInfo[0].organizations : null;
      this.countries = participantInfo.length > 0 ? participantInfo[0].locations : null;
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

  public changeTypeaheadParticipantNoResults(e: boolean) {
    this.typeaheadParticipantNoResults = e;
  }
}
