import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatInputModule, MatFormFieldModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout'
import { FileUploadComponent } from './file-upload.component';

@NgModule({
  declarations: [
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  exports: [
    FileUploadComponent
  ]
})
export class FileUploadModule {
}
