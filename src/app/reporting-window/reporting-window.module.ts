import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { routing, mapRoutingProviders } from './reporting-window.routes';

import { SharedModule } from '../shared/shared.module';
import { ReportingWindowListComponent } from './components/reporting-window-list/reporting-window-list.component';
import { CreateReportingWindowComponent } from './components/edit/create-reporting-window/create-reporting-window.component';
import { ReportingWindowDetailComponent } from './components/edit/reporting-window-detail/reporting-window-detail.component';
import { ReportingWindowElementsComponent } from './components/edit/reporting-window-elements/reporting-window-elements.component';
import { ReportingWindowWorkflowComponent } from './components/edit/reporting-window-workflow/reporting-window-workflow.component';
import { DataQueueComponent } from './components/data-queue/data-queue/data-queue.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    SharedModule,
    AccordionModule.forRoot(),
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    PaginationModule.forRoot(),
    BsDropdownModule,
  ],
  declarations: [
  ReportingWindowListComponent,
  CreateReportingWindowComponent,
  ReportingWindowDetailComponent,
  ReportingWindowElementsComponent,
  ReportingWindowWorkflowComponent,
  DataQueueComponent
  ],
  providers: [
    mapRoutingProviders,
  ]
})
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ReportingWindowModule { }
