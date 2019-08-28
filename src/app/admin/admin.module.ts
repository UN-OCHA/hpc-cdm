import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { OAuthModule } from 'angular-oauth2-oidc';
import {MarkdownToHtmlModule} from 'markdown-to-html-pipe';

import { routing, adminRoutingProviders } from './admin.routes';
import { SharedModule } from '../shared/shared.module';
import { DataTableModule } from 'angular-6-datatable';

// Admin
import { AdminPageComponent } from './components/adminPage/adminPage.component';
import { AdminObjectListComponent } from './components/adminObjectList/adminObjectList.component';
import { AdminObjectComponent } from './components/adminObject/adminObject.component';
import { DynamicFormComponent } from './components/dynamicForm/dynamic-form.component';
import { DynamicFormQuestionComponent } from './components/dynamicFormQuestion/dynamic-form-question.component';

import { IsValidJSONValidatorDirective } from './directives/is-valid-JSON.directive';
import { ShowJsonAsFormComponent } from './components/showJsonAsForm/show-json-as-form.component';
import { AddNewObjectComponent } from './components/addNewObject/add-new-object.component';
import { AdminParticipantOrganizationandCountryComponent } from './components/admin-participant-organizationand-country/admin-participant-organizationand-country.component';
import { AddparticipantComponent } from './components/addparticipant/addparticipant.component';
import { EditparticipantComponent } from './components/editparticipant/editparticipant.component';
import { ListparticipantComponent } from './components/listparticipant/listparticipant.component';
import { ListblueprintComponent } from './components/listblueprint/listblueprint.component';

@NgModule({
  declarations: [
    AdminPageComponent,
    AdminObjectListComponent,
    AdminObjectComponent,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    ShowJsonAsFormComponent,
    AddNewObjectComponent,

    IsValidJSONValidatorDirective,

    AdminParticipantOrganizationandCountryComponent,

    AddparticipantComponent,
    EditparticipantComponent,
    ListparticipantComponent,
    ListblueprintComponent
  ],
  imports: [
    BrowserModule,
    // TagInputModule,
    // MultiselectDropdownModule,
    FormsModule,
    TypeaheadModule,
    ReactiveFormsModule,
    OAuthModule.forRoot(),
    MarkdownToHtmlModule,
    routing,
    SharedModule,
    DataTableModule
  ],
  providers: [
    adminRoutingProviders,
  ],
  bootstrap: [AdminPageComponent]
})
export class AdminModule { }
