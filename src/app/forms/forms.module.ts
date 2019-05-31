import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsComponent } from './forms.component';
import formsRoutes from './forms.routes';

@NgModule({
  imports: [CommonModule, formsRoutes],
  declarations: [FormsComponent]
})
export default class FormsModule{}
