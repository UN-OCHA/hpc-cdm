import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { OAuthModule } from 'angular-oauth2-oidc';

import { routing, adminRoutingProviders } from './admin.routes';
import { SharedModule } from '../shared/shared.module';
import { DataTableModule } from 'angular-6-datatable';

// Admin

import { IsValidJSONValidatorDirective } from './directives/is-valid-JSON.directive';
import { ShowJsonAsFormComponent } from './components/showJsonAsForm/show-json-as-form.component';
import { ListblueprintComponent } from './components/listblueprint/listblueprint.component';
import { ListAttachmentPrototypeComponent } from './components/listAttachmentPrototype/listAttachmentPrototype.component';
import { ListEntityPrototypeComponent } from './components/listEntityPrototype/listEntityPrototype.component';
import { BlueprintFormComponent } from './components/blueprintForm/blueprintForm.component';
import { AttachmentPrototypeFormComponent } from './components/attachmentPrototypeForm/attachmentPrototypeForm.component';
import { EntityPrototypeFormComponent } from './components/entityPrototypeForm/entityPrototypeForm.component';
import { JsonEditorComponent } from './components/jsonEditor/jsonEditor.component';

@NgModule({
  declarations: [
    ShowJsonAsFormComponent,

    IsValidJSONValidatorDirective,

    ListblueprintComponent,
    ListAttachmentPrototypeComponent,
    ListEntityPrototypeComponent,
    BlueprintFormComponent,
    AttachmentPrototypeFormComponent,
    EntityPrototypeFormComponent,
    JsonEditorComponent
  ],
  imports: [
    BrowserModule,
    // TagInputModule,
    // MultiselectDropdownModule,
    FormsModule,
    TypeaheadModule,
    ReactiveFormsModule,
    OAuthModule.forRoot(),
    routing,
    SharedModule,
    DataTableModule
  ],
  providers: [
    adminRoutingProviders,
  ]
})
export class AdminModule { }
