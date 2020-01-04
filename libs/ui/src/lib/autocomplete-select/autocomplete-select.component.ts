import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith, mergeMap} from 'rxjs/operators';


@Component({
  selector: 'autocomplete-select',
  templateUrl: 'autocomplete-select.component.html',
  styleUrls: ['autocomplete-select.component.scss']
})
export class AutocompleteSelectComponent {
  @Input() label;
  @Input() options;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();
  filteredOptions: Observable<any[]>;
  values = [];

  @ViewChild('valueInput', {static: false}) valueInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  constructor() {
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
          this.values.push(value.trim());
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
    // TODO vimago
    // const index = this.values.indexOf(value);
    // if (index >= 0) {
    //   this.values.splice(index, 1);
    // }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.values.push(event.option.viewValue);
    this.valueInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  private _filter(value: any): any[] {
    const filterValue = value ? (value.name ? value.name.toLowerCase() : value.toLowerCase()) : '';
    return this.options
      .filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }
}
