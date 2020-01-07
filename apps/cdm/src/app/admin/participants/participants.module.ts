import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatTableModule } from '@angular/material';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';
import { ParticipantsRoutingModule } from './participants-routing.module';
import { ParticipantsComponent } from './participants.component';
import { ParticipantListComponent } from './participant-list/participant-list.component';
import { ParticipantFormComponent } from './participant-form/participant-form.component';
import { ModeService } from '@hpc/core';
import { UserService } from './participant-list/user.service';

@NgModule({
  declarations: [
    ParticipantsComponent,
    ParticipantListComponent,
    ParticipantFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatTableModule,
    UIModule, CdmUIModule,
    ParticipantsRoutingModule
  ],
  // exports: [
  //   ParticipantListComponent,
  //   ParticipantFormComponent
  // ],
  providers: [
    ModeService,
    UserService
  ]
})
export class ParticipantsModule { }
