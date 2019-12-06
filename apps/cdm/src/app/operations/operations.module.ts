import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@hpc/material';
import { IconSpriteModule } from 'ng-svg-icon-sprite';

import { OperationsRoutingModule } from './operations-routing.module';
import { OperationStepperModule } from './operation-stepper/operation-stepper.module';
import { OperationStepperComponent } from './operation-stepper/operation-stepper.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationItemComponent } from './operation-item/operation-item.component';

import { OperationAttachmentsComponent } from './operation-attachments/operation-attachments.component';
import { OperationAddComponent } from './operation-add/operation-add.component';
import { OperationFormModule } from './operation-form/operation-form.module';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationEntitiesModule } from './operation-entities/operation-entities.module';
import { OperationEntitiesComponent } from './operation-entities/operation-entities.component';

import { AttachmentEntryComponent } from './attachment-entry/attachment-entry.component';
import { EntityEntryModule } from './entity-entry/entity-entry.module';
import { EntityEntryComponent } from './entity-entry/entity-entry.component';
import { EntityBoxComponent } from './entity-box/entity-box.component';

import { TranslatorModule } from '@hpc/core';
import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '../ui/cdm-ui.module';

@NgModule({
  declarations: [
    AttachmentEntryComponent,
    EntityBoxComponent,
    OperationListComponent,
    OperationItemComponent,
    OperationAddComponent,
    OperationAttachmentsComponent
  ],
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    IconSpriteModule,
    // BrowserAnimationsModule,
    UIModule, CdmUIModule, TranslatorModule,
    MaterialModule,
    OperationStepperModule,
    OperationFormModule,
    OperationEntitiesModule,
    EntityEntryModule,
    OperationsRoutingModule,
  ],
  exports: [
    AttachmentEntryComponent,
    EntityEntryComponent,
    EntityBoxComponent,
    OperationAddComponent,
    OperationListComponent,
    OperationEntitiesComponent,
    OperationFormComponent,
    OperationAttachmentsComponent
  ]
})
export class OperationsModule { }
