import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MatIconModule, MatButtonModule } from '@angular/material';

// import { AdminModule } from '../admin/admin.module';
// import { OperationsModule } from '../operations/operations.module';

import { XFormsComponent } from './xforms.component';
import { XFormsRoutingModule } from './xforms-routing.module';

import { EnketoFormModule, ENKETO_FORM_SERVICE } from 'ng-enketo-form';
import { EnketoFormService } from '@cdm/core';

import { UIModule } from '@hpc/ui';
import { CdmUIModule } from '../ui/cdm-ui.module';

@NgModule({
  declarations: [
    XFormsComponent
  ],
  imports: [
    CommonModule,
    // RouterModule,
    // AdminModule,
    // OperationsModule,
    // MatButtonModule, MatIconModule,
    // UIModule, CdmUIModule,
    EnketoFormModule.forRoot({
      enketoFormServiceProvider: {
        provide: ENKETO_FORM_SERVICE,
        useClass: EnketoFormService
      }
    }),    
    XFormsRoutingModule
  ]
})
export class XFormsModule { }
