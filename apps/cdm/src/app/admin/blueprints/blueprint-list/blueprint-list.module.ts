import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlueprintListComponent } from './blueprint-list.component';

@NgModule({
  declarations: [BlueprintListComponent],
  imports: [CommonModule,],
  exports: [BlueprintListComponent],
})
export class BlueprintsListModule { }
