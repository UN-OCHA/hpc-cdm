import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { ParticipantFormComponent } from './participant-form/participant-form.component';

import { operationAdminRoute, adminRoute } from '../admin.utils';

const routes: Routes = [
  adminRoute('participants/:participantId', ParticipantFormComponent),
  operationAdminRoute('participants', ParticipantListComponent),
  operationAdminRoute('participant', ParticipantFormComponent)
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ParticipantsRoutingModule { }
