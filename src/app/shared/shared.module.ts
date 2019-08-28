import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderStatisticComponent } from './components/headerStatistic/headerStatistic.component';
import { ReportProjectTableComponent } from './components/reportProjectTable/reportProjectTable.component';

import { GroupByPipe } from './pipes/group-by.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { UnCamelCasePipe } from './pipes/un-camel-case.pipe';
import { FilterTargetPipe } from './pipes/filter-target.pipe';

import { NumberOnlyValidatorDirective } from './directives/number-only.directive';
import { PercentValidatorDirective } from './directives/percent.directive';
import { IsValidDateValidatorDirective } from './directives/is-valid-date.directive';

import { DateInputFormatterDirective } from './directives/date-input-formatter.directive';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { InputErrorTextComponent } from './components/input-error-text/input-error-text.component';
import { AppMinDirective } from './directives/min.directive';
import { AppMaxDirective } from './directives/max.directive';
import { LocationAndChildrenListComponent } from './components/location-and-children-list/location-and-children-list.component';
import { ValidOrgSelectedDirective } from './directives/valid-org-selected.directive';

@NgModule({
  declarations: [
    // Components
    HeaderStatisticComponent,
    CheckboxComponent,
    ReportProjectTableComponent,

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
    LocationAndChildrenListComponent,
    ValidOrgSelectedDirective
  ],
  imports: [BrowserModule],
  providers: [],
  exports: [
    TranslateModule,
    HeaderStatisticComponent,
    CheckboxComponent,
    ReportProjectTableComponent,
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
    LocationAndChildrenListComponent,
    ValidOrgSelectedDirective
  ]
})
export class SharedModule { }
