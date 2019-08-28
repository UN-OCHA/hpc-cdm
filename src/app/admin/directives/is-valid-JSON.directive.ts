import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appIsValidJSON]',
  providers: [{provide: NG_VALIDATORS, useExisting: IsValidJSONValidatorDirective, multi: true}]
})
export class IsValidJSONValidatorDirective implements Validator {
  @Input() appIsValidJSON: boolean;

  validate(control: AbstractControl): {[key: string]: any} {
    if (this.appIsValidJSON && !this.isJSON(control.value)) {
      return {'is-json': false};
    }
  }

  private isJSON (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
