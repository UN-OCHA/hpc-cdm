import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatTableModule } from '@angular/material';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { ParticipantFormComponent } from './participant-form/participant-form.component';
import { ParticipantsRoutingModule } from './participants-routing.module';

@NgModule({
  declarations: [
    ParticipantListComponent,
    ParticipantFormComponent
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatTableModule,
    UIModule, CdmUIModule,
    ParticipantsRoutingModule
  ],
  exports: [
    ParticipantListComponent,
    ParticipantFormComponent
  ]
})
export class ParticipantsModule { }
