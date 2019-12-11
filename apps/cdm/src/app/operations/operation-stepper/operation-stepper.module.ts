import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdmUIModule } from '@cdm/ui';
// import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { OperationStepperComponent } from './operation-stepper.component';
import { OperationStepperRoutingModule } from './operation-stepper-routing.module';
import { OperationAttachmentsComponent } from './operation-attachments/operation-attachments.component';
import { OperationEntitiesModule } from './operation-entities/operation-entities.module';
import { OperationEntitiesComponent } from './operation-entities/operation-entities.component';
import { EntityAttachmentsModule } from './entity-attachments/entity-attachments.module';
import { EntityEntryModule } from './entity-entry/entity-entry.module';
import { EntityEntryComponent } from './entity-entry/entity-entry.component';
import { AttachmentEntryComponent } from './attachment-entry/attachment-entry.component';
import { AttachmentEntryModule } from './attachment-entry/attachment-entry.module';
import { OperationFormModule } from '../operation-form/operation-form.module';
// import { ReviewModule } from './review/review.module';

@NgModule({
  declarations: [
    OperationStepperComponent,
    OperationAttachmentsComponent,
  ],
  imports: [
    CommonModule,
    CdkStepperModule,
    CdmUIModule,
    // IconSpriteModule.forRoot({ path: '../../assets/sprites/sprite.svg' }),
    FlexLayoutModule,
    FormsModule, ReactiveFormsModule,
    OperationFormModule,
    OperationEntitiesModule,
    EntityEntryModule,
    AttachmentEntryModule,
    EntityAttachmentsModule,
    // ReviewModule,
    OperationStepperRoutingModule
  ],
})
export class OperationStepperModule { }
