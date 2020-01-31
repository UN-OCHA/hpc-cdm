import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdmUIModule } from '@cdm/ui';
import { MaterialModule } from '@hpc/material';
import { EntitiesRoutingModule } from './entities-routing.module';
import { EntitiesComponent } from './entities.component';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityFormComponent } from './entity-form/entity-form.component';
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
  declarations: [
    EntitiesComponent,
    EntityListComponent,
    EntityFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, MaterialModule,
    NgxLoadingModule,
    EntitiesRoutingModule
  ],
  exports: [
    EntitiesComponent,
    EntityListComponent,
    EntityFormComponent,
  ]
})
export class EntityPrototypesModule { }
