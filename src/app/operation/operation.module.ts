import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'

// bootstrap
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { IconSpriteModule } from 'ng-svg-icon-sprite';

import { OAuthModule } from 'angular-oauth2-oidc';

import { routing, operationRoutingProviders } from './operation.routes';
import { Nl2BrPipeModule } from 'nl2br-pipe';
// Edit Page
import { CreateOperationComponent } from './components/edit/create-operation/create-operation.component';

import { SharedModule } from '../shared/shared.module';
import { BasicOperationInfoComponent } from './components/edit/basic-operation-info/basic-operation-info.component';
import { ReviewComponent } from './components/edit/review/review.component';
//import { CreateOrSaveButtonsComponent } from './components/edit/create-or-save-buttons/create-or-save-buttons.component';
import { ReviewBasicComponent } from './components/edit/review/review-basic/review-basic.component';
import { ReviewGoverningEntitiesComponent } from './components/edit/review/review-governing-entities/review-governing-entities.component';
import { OperationAttachmentsComponent } from './components/edit/operation-attachments/operation-attachments.component';
import { OperationEntitiesComponent } from './components/edit/operation-entities/operation-entities.component';
import { OperationEntitiesHeaderComponent } from './components/edit/operation-entities/header/operation-entities-header.component';
import { AttachmentEntryComponent } from './components/edit/attachment-entry/attachment-entry.component';
import { EntityEntryComponent } from './components/edit/entity-entry/entity-entry.component';
import { EntityBoxComponent } from './components/edit/entity-box/entity-box.component';
import { EntityEntryIconComponent } from './components/edit/entity-entry/icon/entity-entry-icon.component';
import { EntityAttachmentsComponent } from './components/edit/entity-attachments/entity-attachments.component';
import { EntityAttachmentsHeaderComponent } from './components/edit/entity-attachments/header/entity-attachments-header.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ReportsNavigationComponent } from './components/reports/navigation/navigation.component';
import { AttachmentViewComponent } from './components/reports/attachment-view/attachment-view.component';
import { EntitiesComponent } from './components/reports/entities/entities.component';

import { EnketoFormModule, ENKETO_FORM_SERVICE } from 'ng-enketo-form';
import { EnketoFormService } from './services/enketo-form.service';

@NgModule({
  declarations: [

    // Edit Operation
    CreateOperationComponent,
    BasicOperationInfoComponent,
    ReviewComponent,

    ReviewBasicComponent,
    ReviewGoverningEntitiesComponent,

    OperationAttachmentsComponent,
    OperationEntitiesComponent,
    OperationEntitiesHeaderComponent,
    AttachmentEntryComponent,
    AttachmentViewComponent,
    EntityBoxComponent,
    EntityEntryComponent,
    EntityEntryIconComponent,
    EntityAttachmentsComponent,
    EntityAttachmentsHeaderComponent,
    ReportsComponent,
    ReportsNavigationComponent,
    EntitiesComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    FormsModule,
    BsDropdownModule,
    BsDatepickerModule.forRoot(),
    IconSpriteModule.forRoot({ path: 'assets/sprites/sprite.svg' }),
    PopoverModule,
    ModalModule,
    ReactiveFormsModule,
    OAuthModule,
    TypeaheadModule,
    AccordionModule,
    TabsModule,
    Nl2BrPipeModule,
    SharedModule,
    EnketoFormModule.forRoot({
      enketoFormServiceProvider: {
        provide: ENKETO_FORM_SERVICE,
        useClass: EnketoFormService
      }
    }),
    routing
  ],
  providers: [
    operationRoutingProviders
  ],
  bootstrap: []
})
export class OperationModule { }
