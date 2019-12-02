import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Route, PreloadAllModules } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UIModule } from '@hpc/ui';
import { OperationsModule } from './operations/operations.module';
import { TranslatorModule } from '@hpc/core';
import { AppRoutingModule } from './app-routing.module';
import { HomeModule } from '@hpc/views';
import { MaterialModule } from  '@hpc/material';

import 'font-awesome/css/font-awesome.css';

const ROUTES = [];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    UIModule,
    HomeModule, AdminModule, DashboardModule, OperationsModule,

    MaterialModule,
    RouterModule.forRoot(ROUTES, {preloadingStrategy: PreloadAllModules}),
    TranslatorModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}


// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { CoreModule } from '../core/core.module';
// HttpClientModule,
// CoreModule,
// import { RouterModule, Route,  PreloadingStrategy } from '@angular/router';

// export class CdmPreloadingStrategy implements PreloadingStrategy {
//   preload(route: Route, load: Function): Observable<any> {
//     return route.data && route.data.preload ? load() : of(null);
//   }
// }
