import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatButtonModule } from '@angular/material';
import { MaterialModule } from '@hpc/material';


import { OperationMenuComponent } from './operation-menu.component';


@NgModule({
  declarations: [
    OperationMenuComponent,
  ],
  imports: [
    CommonModule, RouterModule,
    MatIconModule, MatButtonModule,
    MaterialModule
  ],
  exports: [
    OperationMenuComponent
  ]
})
export class OperationMenuModule { }
