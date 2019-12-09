import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlueprintListComponent } from './blueprint-list.component';

@NgModule({
  declarations: [BlueprintListComponent],
  imports: [CommonModule, RouterModule],
  exports: [BlueprintListComponent],
})
export class BlueprintsListModule { }
