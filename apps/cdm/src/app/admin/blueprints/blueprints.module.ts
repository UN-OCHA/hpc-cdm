import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { BlueprintsComponent } from './blueprints.component';
import { BlueprintFormComponent } from './blueprint-form/blueprint-form.component';
import { BlueprintListComponent } from './blueprint-list/blueprint-list.component';

import { BlueprintsRoutingModule } from './blueprints-routing.module';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

@NgModule({
  declarations: [
    BlueprintsComponent,
    BlueprintFormComponent,
    BlueprintListComponent
  ],
  imports: [
    CommonModule,
    UIModule, CdmUIModule,
    FormsModule, ReactiveFormsModule,
    MaterialModule,
    BlueprintsRoutingModule,
  ],
  exports: [
    BlueprintsComponent,
    BlueprintFormComponent,
    BlueprintListComponent
  ],
  providers: [
    ModeService
  ]
})
export class BlueprintsModule { }
