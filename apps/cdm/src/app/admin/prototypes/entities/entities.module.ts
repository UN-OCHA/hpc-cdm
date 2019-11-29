import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule } from '@angular/material';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';
import { EntityFormComponent } from './entity-form/entity-form.component';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityPrototypesRoutingModule } from './routing.module';

@NgModule({
  declarations: [
    EntityFormComponent,
    EntityListComponent
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    UIModule, CdmUIModule,
    EntityPrototypesRoutingModule
  ],
  exports: [
    EntityFormComponent,
    EntityListComponent
  ]
})
export class EntityPrototypesModule { }
