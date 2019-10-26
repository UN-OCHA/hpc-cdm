import { Injectable } from '@angular/core';
import { AuthService } from 'app/shared/services/auth/auth.service';

const ADMIN_ROLES = ['rpmadmin', 'hpcadmin'];

@Injectable({providedIn: 'root'})
export class ParticipantService {

  isAdmin: boolean;

  constructor(private auth: AuthService){}

  _determineRole(participant) {
    if (participant && participant.roles.length) {
      const adminRoles = participant.roles.find(r => ADMIN_ROLES.includes(r.name));
      this.isAdmin = adminRoles != undefined && this.auth.verifiedUser != undefined;
    }
  }

  load(): void {
    if (!this.auth.participant) {
      this.auth.fetchParticipant().subscribe(participant => {
        this._determineRole(participant.user);
      });
    } else if (this.auth.participant && this.auth.participant.roles) {
      this._determineRole(this.auth.participant);
    }
  }
}
