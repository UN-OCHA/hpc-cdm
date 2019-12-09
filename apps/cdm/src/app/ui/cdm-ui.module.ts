import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { UIModule } from '@hpc/ui';
import { MaterialModule } from '@hpc/material';
import { OperationMenuModule } from './operation-menu/operation-menu.module';
import { OperationMenuComponent } from './operation-menu/operation-menu.component';
import { EntityBoxComponent } from './entity-box/entity-box.component';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [
    EntityBoxComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    IconSpriteModule.forRoot({ path: '../../assets/sprites/sprite.svg' }),
    UIModule,
    OperationMenuModule,
  ],
  exports: [
    OperationMenuComponent,
    EntityBoxComponent,
    UIModule, MaterialModule
  ]
})
export class CdmUIModule { }
