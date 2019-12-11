import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { MaterialModule } from '@hpc/material';
import { ModeService } from '@hpc/core';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';

import { OperationsComponent } from './operations.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationAddComponent } from './operation-add/operation-add.component';
import { OperationFormModule } from './operation-form/operation-form.module';
import { OperationsRoutingModule } from './operations-routing.module';

import { OperationModule } from './operation/operation.module';

@NgModule({
  declarations: [
    OperationsComponent,
    OperationListComponent,
    OperationAddComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CdmUIModule, UIModule, MaterialModule,
    // IconSpriteModule.forRoot({ path: 'assets/sprites/sprite.svg' }),
    OperationModule,
    OperationFormModule,
    OperationsRoutingModule
  ],
  exports: [
    OperationsComponent,
    OperationListComponent,
    OperationAddComponent
  ],
  providers: [
    ModeService
  ]
})
export class OperationsModule { }
