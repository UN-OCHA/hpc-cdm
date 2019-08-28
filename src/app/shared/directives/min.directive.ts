import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appMin][formControlName],[appMin][formControl],[appMin][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: AppMinDirective, multi: true}]
})
export class AppMinDirective implements Validator {
  @Input() appMin: number;

  validate(control: AbstractControl): {[key: string]: any} {
    let v: string = control.value;
    if (v !== null && v !== undefined) {
      v = v.toString();
      return (v && +v.replace(',', '') < this.appMin) ? {'appMin': this.appMin} : null;
    }
  }
}
