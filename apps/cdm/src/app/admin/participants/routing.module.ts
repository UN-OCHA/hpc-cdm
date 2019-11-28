import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { ParticipantFormComponent } from './participant-form/participant-form.component';

import { operationAdminRoute } from '../admin.utils';

const routes: Routes = [
  operationAdminRoute('participants', ParticipantListComponent),
  operationAdminRoute('participants/:participantId', ParticipantFormComponent),
  operationAdminRoute('participant', ParticipantFormComponent)
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class ParticipantsRoutingModule { }
