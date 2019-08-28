import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-addparticipant',
  templateUrl: './addparticipant.component.html',
  styleUrls: ['./addparticipant.component.scss']
})
export class AddparticipantComponent implements OnInit {
  public search: any = {
    Email: ''
  }
  public participant: any = {
    email: '',
    hidId: '',
    name_given: '',
    name_family: ''
  }
  public enableAdd: boolean = false;
  constructor(public apiService: ApiService, private toastr: ToastrService,
    private router: Router) { }

  ngOnInit() {
  }
  public searchByEmail() {
    this.apiService.searchByEmail(this.search.email).subscribe(res => {
      console.log(res);
      if (res.data.hidUser) {
        if (!res.data.hpcUser) {
          this.enableAdd = true;
          this.participant.email = res.data.hidUser.email;
          this.participant.hidId = res.data.hidUser.user_id;
          this.participant.name_given = res.data.hidUser.given_name;
          this.participant.name_family = res.data.hidUser.family_name;
        }
        else {
          if (confirm('Given email address is already linked to plan participant! Do you want tp edit it?')) {
            this.router.navigateByUrl("/admin/editparticipant/" + res.data.hpcUser.id);
          }
        }
      }
      else {
        this.toastr.error("User not found");
      }
    })
  }

  public saveParticipant() {
    this.apiService.saveParticipant(this.participant).subscribe(response => {
      this.router.navigateByUrl("/admin/editparticipant/" + response.data.id);
    })
  }
}
