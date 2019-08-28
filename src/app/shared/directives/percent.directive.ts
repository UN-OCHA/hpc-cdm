import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appPercent]',
  providers: [{provide: NG_VALIDATORS, useExisting: PercentValidatorDirective, multi: true}]
})
export class PercentValidatorDirective implements Validator {

  validate(control: AbstractControl): {[key: string]: any} {
    if (control.value && typeof control.value === 'string' &&
        control.value.match(/[^0-9|,|+]/g)) {
      return {'is-number': 'Not a valid number'}
    } else if (!control.value) {
      return {'is-number': 'Not a number'}
    } else if (control.value > 100) {
      return {'over-100': 'Percent of budget can\'t be over 100.'}
    }
  }
}
