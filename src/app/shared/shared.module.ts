import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderStatisticComponent } from './components/headerStatistic/headerStatistic.component';

import { GroupByPipe } from './pipes/group-by.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { UnCamelCasePipe } from './pipes/un-camel-case.pipe';
import { FilterTargetPipe } from './pipes/filter-target.pipe';

import { NumberOnlyValidatorDirective } from './directives/number-only.directive';
import { PercentValidatorDirective } from './directives/percent.directive';
import { IsValidDateValidatorDirective } from './directives/is-valid-date.directive';

import { DateInputFormatterDirective } from './directives/date-input-formatter.directive';
import { InputErrorTextComponent } from './components/input-error-text/input-error-text.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DateInputComponent } from './components/date-input/date-input.component';
import { TextAreaComponent } from './components/text-area/text-area.component';
import { OperationPageComponent } from './components/operation-page/operation-page.component';
import { OperationPageHeaderComponent } from './components/operation-page/header/header.component';
import { OperationMenuComponent } from './components/operation-menu/operation-menu.component';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { AppMinDirective } from './directives/min.directive';
import { AppMaxDirective } from './directives/max.directive';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    // Components
    OperationPageComponent,
    OperationPageHeaderComponent,
    OperationMenuComponent,
    PageTitleComponent,
    HeaderStatisticComponent,
    FileUploadComponent,
    DateInputComponent,
    TextAreaComponent,

    // Pipes
    GroupByPipe,
    OrderByPipe,
    UnCamelCasePipe,
    FilterTargetPipe,

    // Directives
    NumberOnlyValidatorDirective,
    PercentValidatorDirective,
    IsValidDateValidatorDirective,
    DateInputFormatterDirective,
    InputErrorTextComponent,
    AppMinDirective,
    AppMaxDirective,
  ],
  imports: [
    BrowserModule,
    BsDatepickerModule.forRoot(),
    RouterModule
  ],
  providers: [],
  exports: [
    TranslateModule,
    HeaderStatisticComponent,
    OperationPageComponent,
    OperationMenuComponent,
    PageTitleComponent,
    FileUploadComponent,
    DateInputComponent,
    TextAreaComponent,
    InputErrorTextComponent,

    GroupByPipe,
    OrderByPipe,
    UnCamelCasePipe,
    FilterTargetPipe,

    NumberOnlyValidatorDirective,
    PercentValidatorDirective,
    IsValidDateValidatorDirective,
    DateInputFormatterDirective,
    AppMinDirective,
    AppMaxDirective,
  ]
})
export class SharedModule { }
