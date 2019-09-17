
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
// import 'reflect-metadata';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';


import { CommonModule } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ToastrModule } from 'ngx-toastr';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { OAuthModule } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { APIStateComponent } from './shared/components/shell/apiState/apiState.component';
import { HeaderComponent } from './shared/components/shell/header/header.component';
import { HomeComponent } from './shared/components/shell/home/home.component';

import { routing, appRoutingProviders } from './app.routes';

import { AuthGuard } from 'app/shared/services/auth/auth.guard.service';
import { PendingChangesGuard } from 'app/shared/services/auth/pendingChanges.guard.service';
import { ApiService } from 'app/shared/services/api/api.service';
import { UtilitiesService } from 'app/shared/services/utilities.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { ExportService } from 'app/shared/services/export.service';
import { PromptUpdateService } from 'app/shared/services/prompt-update.service';
import { LocalStorageService } from 'app/shared/services/localStorage.service';

import { LoginComponent } from './shared/components/shell/login/login.component';
import { LogoutComponent } from './shared/components/shell/logout/logout.component';

import { MapModule } from './map/map.module';
import { OperationModule } from './operation/operation.module';
import { AdminModule } from './admin/admin.module';

import { SharedModule } from './shared/shared.module';

import { environment } from 'environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    // Standard App Parts
    AppComponent,
    APIStateComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    LogoutComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      closeButton: true,
      preventDuplicates: true
    }),
    CollapseModule.forRoot(),
    DatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TypeaheadModule.forRoot(),
    OAuthModule.forRoot(),
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
    }),
    routing,

    MapModule,
    AdminModule,
    OperationModule,

    SharedModule,

    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production})

  ],
  providers: [
    ApiService,
    AuthService,
    ExportService,
    UtilitiesService,
    PromptUpdateService,
    AuthGuard,
    PendingChangesGuard,
    LocalStorageService,
    appRoutingProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
