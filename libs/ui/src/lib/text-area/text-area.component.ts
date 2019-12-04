import { Optional, Host, SkipSelf, Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'hpc-textarea',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  providers: [
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: forwardRef(() => TextAreaComponent),
    //   multi: true
    // },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true
    }
  ]
})
export class TextAreaComponent implements ControlValueAccessor, OnInit {
  @Input() label: string;
  @Input() required?: boolean;
  @Input() disabled?: boolean;
  @Input() formControlName: string;

  onTouched: any = () => {};
  onChange: any = () => {};

  value: string;
  // valid: boolean;

  control: AbstractControl;

  constructor(
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer
  ){}

  ngOnInit(): void {
    this.required = typeof this.required !== 'undefined';
    this.control = this.controlContainer.control.get(this.formControlName);
  }

  writeValue(value: string): void {
    this.value = value ? value : '';
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  handleChange(value): void {
    this.onChange(value);
  }
}


// <div style="display:none"
//   [hidden]="control.valid || control.pristine"
//   class="alert alert-danger">
//   {{label}} is required
