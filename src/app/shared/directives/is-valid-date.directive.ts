import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

import * as moment from 'moment';

@Directive({
  selector: '[appIsValidDate]',
  providers: [{provide: NG_VALIDATORS, useExisting: IsValidDateValidatorDirective, multi: true}]
})
export class IsValidDateValidatorDirective implements Validator {
  @Input() maxDate: string;
  @Input() minDate: string;

  validate(control: AbstractControl): {[key: string]: any} {
    const format = 'DD/MM/YYYY';
    const momentValue = moment(control.value, format);
    const momentMaxDate = moment(this.maxDate, format);
    const momentMinDate = moment(this.minDate, format);

    if (!momentValue.isValid()) {
      return {'is-date': false};
    }
    if (momentValue.isValid() &&
        this.maxDate &&
        momentMaxDate.isValid() &&
        momentMaxDate.isBefore(momentValue)) {
      return {'is-date-valid': 'After end date'};
    }
    if (momentValue.isValid() &&
        this.minDate &&
        momentMinDate.isValid() &&
        momentMinDate.isAfter(momentValue)) {
      return {'is-date-valid': 'Before start date'};
    }
  }
}
