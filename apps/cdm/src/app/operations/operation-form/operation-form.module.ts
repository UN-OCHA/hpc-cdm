import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { MaterialModule } from '@hpc/material';
import { CdmUIModule } from '@cdm/ui';
import { UIModule } from '@hpc/ui';
import { OperationFormComponent } from './operation-form.component';
// import { OperationFormStep1Component } from './operation-form-step-1/step1.component';

// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http);
// }

@NgModule({
  declarations: [
    OperationFormComponent,
    // OperationFormStep1Component,
  ],
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    // BrowserAnimationsModule,
    CdmUIModule, UIModule, MaterialModule,
    // HttpClientModule,
    // TypeaheadModule,
    // TranslateModule.forRoot({
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: HttpLoaderFactory,
    //       deps: [HttpClient]
    //     }
    // }),
  ]
})
export class OperationFormModule { }
