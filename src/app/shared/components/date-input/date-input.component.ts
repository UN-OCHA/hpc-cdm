import { Optional, Host, SkipSelf, Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
    this.value = value ? value : '';
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  // validate({value}: FormControl) {
  //   console.log(value);
  //   return {invalid: false};//this.value.length === 0};
  // }
}
