import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatorModule } from '@hpc/core';

import { NavComponent } from './nav/nav.component';
import { NavModule } from './nav/nav.module';
import { DateInputModule } from './date-input/date-input.module';
import { DateInputComponent } from './date-input/date-input.component';
import { EmergencySelectComponent } from './emergency-select/emergency-select.component';
import { EmergencySelectModule } from './emergency-select/emergency-select.module';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { InputModule } from './input/input.module';
import { InputComponent } from './input/input.component';
import { JsonEditorModule } from './json-editor/json-editor.module';
import { JsonEditorComponent } from './json-editor/json-editor.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { LocationSelectComponent } from './location-select/location-select.component';
import { LocationSelectModule } from './location-select/location-select.module';
import { LoginLinkModule } from './login-link/login-link.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TableExpandableRowsComponent } from './table-expandable-rows/table-expandable-rows.component';
import { TableExpandableRowsModule } from './table-expandable-rows/table-expandable-rows.module';
import { TableSelectableRowsComponent } from './table-selectable-rows/table-selectable-rows.component';
import { TableSelectableRowsModule } from './table-selectable-rows/table-selectable-rows.module';
import { LogoComponent } from './logo/logo.component';
import { LogoModule } from './logo/logo.module';
import { LanguagesComponent } from './languages/languages.component';
import { LanguagesModule } from './languages/languages.module';
import { FeedComponent } from './feed/feed.component';
import { FeedModule } from './feed/feed.module';
import { ScrollContainerComponent } from './scroll-container/scroll-container.component';
// import { ScrollContainerModule } from './scroll-container/scroll-container.module';
import { SpinnerComponent } from './spinner/spinner.component';
import { SpinnerModule } from './spinner/spinner.module';


@NgModule({
  declarations: [
    FileUploadComponent,
    ScrollContainerComponent,
    TextAreaComponent,
    ToolbarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    DateInputModule,
    EmergencySelectModule,
    InputModule,
    JsonEditorModule,
    TableExpandableRowsModule,
    TableSelectableRowsModule,
    TranslatorModule,
    LocationSelectModule,
    LoginLinkModule,
    LogoModule,
    LanguagesModule,
    NavModule,
    FeedModule,
    // ScrollContainerModule,
    SpinnerModule
  ],
  exports: [
    FeedComponent,
    DateInputComponent,
    EmergencySelectComponent,
    FileUploadComponent,
    InputComponent,
    JsonEditorComponent,
    TableExpandableRowsComponent,
    TableSelectableRowsComponent,
    TextAreaComponent,
    ToolbarComponent,
    LocationSelectComponent,
    LogoComponent,
    LanguagesComponent,
    NavComponent,
    ScrollContainerComponent,
    SpinnerComponent
  ]
})
export class UIModule {}