import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appMax][formControlName],[appMax][formControl],[appMax][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: AppMaxDirective, multi: true}]
})
export class AppMaxDirective implements Validator {
  @Input() appMax: number;

  validate(control: AbstractControl): {[key: string]: any} {
    let v: string = control.value;
    if (v !== null && v !== undefined) {
      v = v.toString();
      return (v && +v.replace(',', '') > this.appMax) ? {'appMax': this.appMax} : null;
    }
  }
}
