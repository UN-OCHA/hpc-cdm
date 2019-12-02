import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JsonEditorComponent } from './json-editor.component';

@NgModule({
  declarations: [
    JsonEditorComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    JsonEditorComponent
  ]
})
export class JsonEditorModule {
}
