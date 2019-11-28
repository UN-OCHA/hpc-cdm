import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { UIModule } from '@hpc/ui';
import { OperationPageComponent } from './operation-page/operation-page.component';
import { OperationPageHeaderComponent } from './operation-page/operation-page-header/header.component';
import { OperationTitleModule } from './operation-title/operation-title.module';
import { OperationTitleComponent } from './operation-title/operation-title.component';
import { OperationMenuModule } from './operation-menu/operation-menu.module';
import { OperationMenuComponent } from './operation-menu/operation-menu.component';
import { EntityBoxComponent } from './entity-box/entity-box.component';
import { LayoutModule } from './layout/layout.module';
import { CdmPageModule } from './cdm-page/cdm-page.module';
import { CdmPageComponent } from './cdm-page/cdm-page.component';
import { CdmTableModule } from './cdm-table/cdm-table.module';
import { CdmTableComponent } from './cdm-table/cdm-table.component';
import { OperationTableComponent } from './operation-table/operation-table.component';
import { OperationTableModule } from './operation-table/operation-table.module';

@NgModule({
  declarations: [
    OperationPageComponent,
    OperationPageHeaderComponent,
    EntityBoxComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    LayoutModule,
    IconSpriteModule.forRoot({ path: 'assets/sprites/sprite.svg' }),
    UIModule, CdmPageModule, CdmTableModule, OperationTableModule,
    OperationTitleModule, OperationMenuModule,
  ],
  exports: [
    OperationPageComponent,
    OperationPageHeaderComponent,
    OperationTitleComponent,
    OperationMenuComponent,
    EntityBoxComponent,
    CdmPageComponent, CdmTableComponent, OperationTableComponent
  ]
})
export class CdmUIModule { }
