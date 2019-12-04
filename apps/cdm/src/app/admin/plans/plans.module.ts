import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@hpc/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlansRoutingModule } from './plans-routing.module';
import { PlanListComponent } from './plan-list/plan-list.component';
import { PlanFormComponent } from './plan-form/plan-form.component';

import { TranslatorModule } from '@hpc/core';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

@NgModule({
  declarations: [
    PlanListComponent,
    PlanFormComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    UIModule, CdmUIModule, TranslatorModule, MaterialModule,
    PlansRoutingModule,
  ],
  exports: [
    PlanListComponent
  ]
})
export class PlansModule { }
