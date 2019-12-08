import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParticipantsComponent } from './participants.component';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { ParticipantFormComponent } from './participant-form/participant-form.component';

import { AdminGuard } from '@hpc/core';

const routes: Routes = [
  { path: '', component: ParticipantsComponent, canActivate: [AdminGuard],
    children: [
      { path: '', component: ParticipantListComponent },
      { path: 'new', component: ParticipantFormComponent },
      { path: ':id', component: ParticipantFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParticipantsRoutingModule { }
