import { Optional, Host, SkipSelf, Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    }
  ]
})
export class DateInputComponent implements ControlValueAccessor, OnInit {
  @Input() id: string;
  @Input() label: string;
  @Input() required?: boolean;
  @Input() disabled?: boolean;
  @Input() formControlName: string;

  onTouched: any = () => {};
  onChange: any = () => {};
  value: string;
  control: AbstractControl;

  constructor(
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer
  ){}

  ngOnInit() {
    this.required = typeof this.required !== 'undefined';
    this.control = this.controlContainer.control.get(this.formControlName);
  }

  writeValue(value: string): void {
    if(value && JSON.stringify(value) !== 'null') {
      this.value = moment(value).format('DD/MM/YYYY');
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}



// <div class="input-group">
//   <input class="form-control"
//     [ngClass]="disabled ? '' : required && control.valid ? 'ng-valid' : required ? 'ng-invalid' : ''"
//     [value]="value"
//     [disabled]="disabled"
//     #bsDatepicker="bsDatepicker"
//     bsDatepicker
//     [bsConfig]="{ dateInputFormat: 'DD/MM/YYYY' }"
//     (bsValueChange)="onChange($event)">
//   <div class="input-group-append">
//     <button (click)="bsDatepicker.toggle()"
//       [disabled]="disabled"
//       [attr.aria-expanded]="bsDatepicker.isOpen"
//       class="btn btn-outline-secondary"
//       type="button"><i class="material-icons">calendar_today</i></button>
//   </div>
// </div>
// </div>
