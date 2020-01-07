import { Component, OnInit, Input, Self, forwardRef } from '@angular/core';
import { FormGroup, FormControl, Validators,
  NgControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


@Component({
  selector: 'hpc-autocomplete-single',
  templateUrl: './autocomplete-single.component.html',
  styleUrls: ['./autocomplete-single.component.scss']
})
export class AutocompleteSingleComponent implements ControlValueAccessor, OnInit {
  @Input() label: string;
  @Input() options$;
  @Input() required?;
  @Input() disabled?;

  options: any[] = [];
  filteredOptions: Observable<any[]>;
  value: string;

  onTouched: any = () => {};
  onChange: any = () => {};

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  ngOnInit() {
    this.required = typeof this.required !== 'undefined';
    this.disabled = typeof this.disabled !== 'undefined';
    this.filteredOptions = this.ngControl.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    this.options$.subscribe(options => {
      console.log(options)
      this.options = options;
    })
  }

  //ControlValueAccessor interface
  writeValue(value: any): void {
    this.value = value ? value.name : '';
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  handleChange(value): void {
    this.onChange(value);
  }

  setDisabledState?(isDisabled: boolean) { }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const filtered = (option) => option.name.toLowerCase().indexOf(filterValue) === 0
    return this.options.filter(option => filtered(option));
  }
}

// <mat-form-field *ngIf="mode === 'add'" appearance="outline">
//   <mat-label>Blueprint</mat-label>
//   <mat-select required formControlName="blueprint">
//     <mat-option *ngFor="let bp of blueprints$ | async" [value]="bp">
//       {{bp.name}}
//     </mat-option>
//   </mat-select>
// </mat-form-field>
