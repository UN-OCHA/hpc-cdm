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
  @Input() required?;
  @Input() disabled?;
  @Input() maxlength?;
  @Input() rows?;
  // @Input() formControlName: string;

  onTouched: any = () => {};
  onChange: any = () => {};

  value: string;
  // valid: boolean;

  totalChars = 0;

  // control: AbstractControl;

  constructor(@Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer){
  }

  ngOnInit(): void {
    this.required = typeof this.required !== 'undefined';
    this.disabled = typeof this.disabled !== 'undefined';
    // this.control = this.controlContainer.control.get(this.formControlName);
  }

  writeValue(value: string): void {
    this.value = value ? value : '';
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  handleChange(value): void {
    this.totalChars = value.length;
    this.onChange(value);
  }
}






// <mat-form-field appearance="outline">
//   <mat-label for="description">Summary</mat-label>
//   <textarea matInput maxlength="400"
//     #summary
//     (input)='summaryChange(summary.value)'
//     class="form-control"  formControlName="description"
//     [ngClass]="{ 'is-invalid': submitted && f.description.errors }"
//     rows=3
//     type="text" id="description" name="description" required></textarea>
// </mat-form-field>
// <div class="maxlength">Max length: {{charsUsed}}/{{maxChars}}</div>

























// <div style="display:none"
//   [hidden]="control.valid || control.pristine"
//   class="alert alert-danger">
//   {{label}} is required


// <label class="label-control" translate>{{label}}</label> <i *ngIf="required && !disabled" class="text-danger">*</i>





// <div [hidden]="f.description.valid || f.description.pristine" class="alert alert-danger">
//     Description is required
// </div>
