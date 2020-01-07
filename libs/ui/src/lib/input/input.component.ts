import { Optional, Host, SkipSelf, Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'hpc-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string;
  @Input() required?;
  @Input() disabled?;
  // @Input() formControlName: string;
  // control: AbstractControl;
  onTouched: any = () => {};
  onChange: any = () => {};
  value: string;

  constructor(
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer
  ){}

  ngOnInit() {
    this.required = typeof this.required !== 'undefined';
    this.disabled = typeof this.disabled !== 'undefined';
    // console.log(this.formControlName)
    // this.control = this.controlContainer.control.get(this.formControlName);
  }

  //ControlValueAccessor interface
  writeValue(value: string): void {
    this.value = value ? value : '';
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean) { }

  handleChange(value): void {
    this.onChange(value);
  }
}
