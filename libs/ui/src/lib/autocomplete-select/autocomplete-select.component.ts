import {COMMA, ENTER} from '@angular/cdk/keycodes';
// import { Optional, Host, SkipSelf, Component, Input, OnInit,  } from '@angular/core';
import {Component, Input, Output, OnInit, ElementRef, ViewChild, forwardRef, EventEmitter} from '@angular/core';
import { FormControl, ControlContainer, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith, mergeMap} from 'rxjs/operators';


@Component({
  selector: 'hpc-autocomplete-select',
  templateUrl: 'autocomplete-select.component.html',
  styleUrls: ['autocomplete-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteSelectComponent),
      multi: true
    }
  ]
})
export class AutocompleteSelectComponent implements OnInit {
  @Input() label;
  @Input() required?;
  @Input() hint?: string;
  @Input() options$;
  @Input() options?;
  @Input() singleSelect: boolean = false;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();
  filteredOptions: Observable<any[]>;
  values = [];
  selectedIds = [];

  @ViewChild('valueInput', {static: false}) valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  ngOnInit() {
    this.required = typeof this.required !== 'undefined';
    this.options$.subscribe(options => {
      this.options = options;
    });
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((value: any | null) =>
        value ? this._filter(value) : this.options.slice()));
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if(value) {
        if ((value || '').trim()) {
          if(!this.singleSelect || this.singleSelect && this.values.length === 0) {
            this.values.push(value.trim());
          }
        }

        // Reset the input value
        if (input) {
          input.value = '';
        }
        this.optionCtrl.setValue(null);
      }
    }
  }

  remove(value: any): void {
    const index = this.values.indexOf(value);
    if (index >= 0) {
      this.values.splice(index, 1);
      this.selectedIds.splice(index, 1);
      this.change.emit(this.selectedIds);
    }
  }

  checkOption() {
    this.valueInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if(!this.singleSelect || this.singleSelect && this.values.length === 0) {
      this.values.push(event.option.viewValue);
      this.selectedIds.push(event.option.value.id);
      this.change.emit(this.selectedIds);
    }
    this.valueInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  private _filter(value: any): any[] {
    const filterValue = value ? (value.name ? value.name.toLowerCase() : value.toLowerCase()) : '';
    return this.options
      .filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }
}
