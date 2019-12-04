import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith, mergeMap} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '@hpc/core';


@Component({
  selector: 'location-select',
  templateUrl: 'location-select.component.html',
  styleUrls: ['location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {
  selectedLocationName = '';

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();
  filteredOptions: Observable<string[]>;
  values: string[] = ['Lemon'];
  options: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('locationInput', {static: false}) locationInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  constructor(
    private api: ApiService,
    private translate: TranslateService) {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) =>
        value ? this._filter(value) : this.options.slice()));
  }

  ngOnInit() {
  }

  changeTypeaheadNoResults(e: boolean) {
    // this.typeaheadNoResults = e;
  }

  onDeleteLocation(idx:any) {
  }

  checkValidity () {
    // if (this.childForm &&
    //     this.childForm.valid &&
    //     this.createOperationService.operation &&
    //     this.createOperationService.operation.emergencies.length &&
    //     this.createOperationService.operation.emergencies.length) {
    //   this.isValid = true;
    // } else {
    //   this.isValid = false;
    // }
  }

  add(event: MatChipInputEvent): void {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-add')
    // Add location only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add location
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

  remove(value: string): void {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-remove')
    const index = this.values.indexOf(value);

    if (index >= 0) {
      this.values.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-selected')
    this.values.push(event.option.viewValue);
    this.locationInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-filter:'+value.length)
    const filterValue = value.toLowerCase();
    return this.options
      .filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
}
