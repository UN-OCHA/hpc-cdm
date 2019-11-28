import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import {
  MatTabsModule,
  MatTableModule,
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatStepperModule,
  MatInputModule,
} from '@angular/material';
import { CdmUIModule } from '@cdm/ui';
import { OperationFormComponent } from './operation-form.component';
import { OperationFormStep1Component } from './operation-form-step-1/step1.component';
import { RegistrationStep1Component } from './registration-step1/registration-step1.component';
import { RegistrationStep2Component } from './registration-step2/registration-step2.component';
import { RegistrationStep3Component } from './registration-step3/registration-step3.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    OperationFormComponent,
    OperationFormStep1Component,
    RegistrationStep1Component,
    RegistrationStep2Component,
    RegistrationStep3Component
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    BrowserAnimationsModule,
    CdmUIModule,
    MatToolbarModule, MatButtonModule, MatSidenavModule,
    MatTabsModule, MatIconModule, MatListModule, MatStepperModule,
    MatInputModule, MatTableModule,
    HttpClientModule,
    TypeaheadModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
    }),
  ]
})
export class OperationFormModule { }
