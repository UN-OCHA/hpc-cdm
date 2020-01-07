import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[hpcAutocompleteContent]'
})
export class AutocompleteContentDirective {
  constructor( public tpl: TemplateRef<any> ) {
  }
}
