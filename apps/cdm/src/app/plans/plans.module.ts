import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@hpc/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlansRoutingModule } from './plans-routing.module';
import { PlansComponent } from './plans.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { PlanFormComponent } from './plan-form/plan-form.component';

import { TranslatorModule } from '@hpc/core';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

@NgModule({
  declarations: [
    PlansComponent,
    PlanListComponent,
    PlanFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    UIModule, CdmUIModule, TranslatorModule, MaterialModule,
    PlansRoutingModule,
  ],
})
export class PlansModule { }
