import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';

import { ModeService } from '@hpc/core';
import { VersionsComponent } from './versions.component';
import { VersionsRoutingModule } from './versions-routing.module';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '@cdm/ui';

@NgModule({
  declarations: [
    VersionsComponent,
  ],
  imports: [
    CommonModule,
    UIModule, CdmUIModule,
    FormsModule, ReactiveFormsModule,
    MaterialModule,
    VersionsRoutingModule,
  ],
  exports: [
    VersionsComponent,
  ],
  providers: [
    ModeService
  ]
})
export class VersionsModule { }
