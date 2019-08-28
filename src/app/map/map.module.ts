import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { routing, mapRoutingProviders } from './map.routes';

import { SharedModule } from '../shared/shared.module';
import { MapWrapperComponent } from './components/map-wrapper/map-wrapper.component';


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
    MapWrapperComponent,
  ],
  providers: [
    mapRoutingProviders,
  ]
})
export class MapModule { }
