import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
// import { ToastrModule } from 'ngx-toastr';

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
    // ToastrModule.forRoot({
    //   positionClass: 'toast-top-center',
    //   closeButton: true,
    //   preventDuplicates: true
    // }),
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
