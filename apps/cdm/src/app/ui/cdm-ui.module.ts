import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { UIModule } from '@hpc/ui';
import { MaterialModule } from '@hpc/material';
import { OperationPageModule } from './operation-page/operation-page.module';
import { OperationPageComponent } from './operation-page/operation-page.component';
import { WindowPageModule } from './window-page/window-page.module';
import { WindowPageComponent } from './window-page/window-page.component';
import { OperationTitleModule } from './operation-title/operation-title.module';
import { OperationTitleComponent } from './operation-title/operation-title.component';
import { OperationMenuModule } from './operation-menu/operation-menu.module';
import { OperationMenuComponent } from './operation-menu/operation-menu.component';
import { EntityBoxComponent } from './entity-box/entity-box.component';
import { LayoutModule } from './layout/layout.module';
import { CdmPageModule } from './cdm-page/cdm-page.module';
import { CdmPageComponent } from './cdm-page/cdm-page.component';
import { OperationTableComponent } from './operation-table/operation-table.component';
import { OperationTableModule } from './operation-table/operation-table.module';

@NgModule({
  declarations: [
    EntityBoxComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    IconSpriteModule.forRoot({ path: 'assets/sprites/sprite.svg' }),
    UIModule,
    CdmPageModule,
    OperationPageModule,
    OperationTableModule,
    WindowPageModule,
    OperationTitleModule, OperationMenuModule,
  ],
  exports: [
    OperationPageComponent,
    WindowPageComponent,
    OperationTitleComponent,
    OperationMenuComponent,
    EntityBoxComponent,
    CdmPageComponent, OperationTableComponent,
    UIModule, MaterialModule
  ]
})
export class CdmUIModule { }
