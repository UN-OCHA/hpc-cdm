import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appValidOrgSelected][formControlName],[appValidOrgSelected][formControl],[appValidOrgSelected][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: ValidOrgSelectedDirective, multi: true}]
})
export class ValidOrgSelectedDirective implements Validator {
  @Input() appValidOrgSelected: Array<any>;

  validate(control: AbstractControl): {[key: string]: any} {
    const isValid = this.appValidOrgSelected && this.appValidOrgSelected.length > 0;
    if (!isValid) {
      return {'valid-org': !isValid};
    }
  }
}
