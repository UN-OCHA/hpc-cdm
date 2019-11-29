import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule, MatExpansionModule, MatIconModule, MatButtonModule, MatTableModule } from '@angular/material';
import { ToastrModule } from 'ngx-toastr';

// import { DataTableModule } from 'angular-6-datatable';

import { BlueprintFormComponent } from './blueprint-form/blueprint-form.component';
import { BlueprintListComponent } from './blueprint-list/blueprint-list.component';


import { BlueprintsRoutingModule } from './blueprints-routing.module';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

@NgModule({
  declarations: [
    BlueprintFormComponent,
    BlueprintListComponent
  ],
  imports: [
    CommonModule, RouterModule, BrowserAnimationsModule,
    UIModule, CdmUIModule,
    FormsModule, ReactiveFormsModule,
    BlueprintsRoutingModule,
    MatInputModule, MatFormFieldModule, MatExpansionModule, MatIconModule, MatButtonModule, MatTableModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      closeButton: true,
      preventDuplicates: true
    }),
  ],
  exports: [
    BlueprintFormComponent,
    BlueprintListComponent
  ],
})
export class BlueprintsModule { }
