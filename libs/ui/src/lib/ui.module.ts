import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatorModule } from '@hpc/core';

import { NavModule, NavComponent } from './nav';
import { CustomStepperModule, CustomStepperComponent } from './custom-stepper';
import { DateInputModule, DateInputComponent } from './date-input';
import { FileUploadModule, FileUploadComponent } from './file-upload';
import { InputModule, InputComponent } from './input';
import { JsonEditorModule, JsonEditorComponent } from './json-editor';
import { TextAreaModule, TextAreaComponent } from './text-area';
import { AutocompleteSelectModule, AutocompleteSelectComponent } from './autocomplete-select';
import { LoginLinkModule } from './login-link';
import { ToolbarComponent } from './toolbar';
import { TableExpandableRowsModule, TableExpandableRowsComponent } from './table-expandable-rows';
import { TableSelectableRowsModule, TableSelectableRowsComponent } from './table-selectable-rows';
import { LogoModule, LogoComponent } from './logo';
import { LanguagesModule, LanguagesComponent } from './languages';
import { FeedModule, FeedComponent } from './feed';
import { ScrollContainerModule, ScrollContainerComponent } from './scroll-container';
import { SpinnerModule, SpinnerComponent } from './spinner';
import { AutocompleteModule, AutocompleteComponent,
  AutocompleteDirective, AutocompleteContentDirective,
  OptionComponent } from './autocomplete';
import { AutocompleteSingleModule, AutocompleteSingleComponent } from './autocomplete-single';
import { PaginatedTableModule, PaginatedTableComponent } from './paginated-table';
import { FilterPipe } from './filter.pipe';

@NgModule({
  declarations: [
    ScrollContainerComponent,
    ToolbarComponent,
    FilterPipe,
  ],
  imports: [
    CommonModule, RouterModule,
    AutocompleteSingleModule,
    AutocompleteModule,
    AutocompleteSelectModule,
    CustomStepperModule,
    DateInputModule,
    FileUploadModule,
    InputModule,
    JsonEditorModule,
    TableExpandableRowsModule,
    TableSelectableRowsModule,
    TextAreaModule,
    TranslatorModule,
    LoginLinkModule,
    LogoModule,
    LanguagesModule,
    NavModule,
    PaginatedTableModule,
    FeedModule,
    SpinnerModule
  ],
  exports: [
    AutocompleteSingleComponent,
    AutocompleteComponent,
    AutocompleteContentDirective,
    AutocompleteDirective,
    OptionComponent,
    AutocompleteSelectComponent,
    FeedComponent,
    CustomStepperComponent,
    DateInputComponent, FileUploadComponent,
    InputComponent, TextAreaComponent,
    JsonEditorComponent,
    PaginatedTableComponent,
    FilterPipe,
    LogoComponent, LanguagesComponent,
    ScrollContainerComponent,
    SpinnerComponent,
    TableExpandableRowsComponent, TableSelectableRowsComponent,
    ToolbarComponent, NavComponent
  ]
})
export class UIModule {}
