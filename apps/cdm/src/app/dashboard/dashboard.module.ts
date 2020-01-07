import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

import { UIModule } from '@hpc/ui';
import { MaterialModule } from '@hpc/material';
// import {MatAutocompleteModule} from '@angular/material/autocomplete';

// import { AutocompleteComponent } from './autocomplete/autocomplete.component';
// import { FilterPipe } from './filter.pipe';
// declarations: [AppComponent, FilterPipe],

import { App2Service } from './app.service';

@NgModule({
  declarations: [
    DashboardComponent,
    // FilterPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    UIModule,
    MaterialModule,
    // BrowserAnimationsModule,
    // AutocompleteModule,
    DashboardRoutingModule
  ],
  providers: [
    App2Service
  ]
})
export class DashboardModule { }
