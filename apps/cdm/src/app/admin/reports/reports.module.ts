import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportListComponent } from './report-list/report-list.component';
import { ReportNavComponent } from './report-nav/report-nav.component';
import { EntitiesComponent } from './entities/entities.component';
import { AttachmentViewComponent } from './attachment-view/attachment-view.component';

import { ReportsRoutingModule } from './routing.module';

import { EnketoFormModule, ENKETO_FORM_SERVICE } from 'ng-enketo-form';
import { EnketoFormService } from '@cdm/core';
import { CdmUIModule } from '@cdm/ui';


@NgModule({
  declarations: [
    AttachmentViewComponent,
    EntitiesComponent,
    ReportListComponent,
    ReportNavComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    EnketoFormModule.forRoot({
      enketoFormServiceProvider: {
        provide: ENKETO_FORM_SERVICE,
        useClass: EnketoFormService
      }
    }),
    CdmUIModule,
    FormsModule, ReactiveFormsModule,
    ReportsRoutingModule
  ],
})
export class ReportsModule { }
