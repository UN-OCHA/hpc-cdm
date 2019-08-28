import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appNumberOnly]',
  providers: [{provide: NG_VALIDATORS, useExisting: NumberOnlyValidatorDirective, multi: true}]
})
export class NumberOnlyValidatorDirective implements Validator {

  validate(control: AbstractControl): {[key: string]: any} {
    if (control.value && typeof control.value === 'string' &&
        control.value.match(/[^0-9|,|+]/g)) {
      return {'is-number': 'Not a valid number'}
    } else if (control.value === undefined || control.value === null) {// Make sure "0" is okay.
      if (control.errors && control.errors.required) {
        return {'is-number': 'Not a number'}
      }
    }
  }
}
