import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, OnInit, ElementRef, ViewChild, Input, EventEmitter, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable, of} from 'rxjs';
import {startWith, mergeMap} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '@hpc/core';


@Component({
  selector: 'location-select',
  templateUrl: 'location-select.component.html',
  styleUrls: ['location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {
  @Input() index: number;
  @Input() selectedLocations: any
  @Output() messageEvent = new EventEmitter<string>();
  selectedLocationName = '';

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();

  optionSubLocationCtrl = new FormControl();
  filteredOptions: Observable<any>;
  filteredSubLocationOptions: Observable<any>;
  displayValues: any[] = [];
  selectedValues: any[] = [];
  options: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  enableSubLocations = false;
  subLocations: any[];

  @ViewChild('locationInput', {static: false}) locationInput: ElementRef<HTMLInputElement>;

  @ViewChild('subLocationInput', {static: false}) subLocationInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  constructor(
    private api: ApiService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      mergeMap((value: string | null) =>
        value && value.length > 2 ? this.api.autocompleteLocation(value) : []));

      this.filteredSubLocationOptions = this.optionSubLocationCtrl.valueChanges.pipe(
          startWith(''),
          mergeMap((value: string | null) => this._filter(value)));
      this.optionCtrl.setValue(this.selectedLocations);
      if(this.selectedLocations.sublocations) {
        this.enableSubLocations = true;
        this.selectedLocations.sublocations.forEach(subLoc => {
          this.displayValues.push(subLoc.name);
          this.selectedValues.push(subLoc.id);
        });
      }
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



  remove(value: string): void {
    const index = this.displayValues.indexOf(value);
    if (index >= 0) {
      this.displayValues.splice(index, 1);
      this.selectedValues.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.enableSubLocations = event.option.value.children.length > 0 ? true : false;
    this.subLocations = event.option.value.children;
  }
  selectedSubLocation(event: MatAutocompleteSelectedEvent) : void {
    this.displayValues.push(event.option.viewValue);
    this.selectedValues.push(event.option.value.id);
    this.subLocationInput.nativeElement.value = '';
    this.optionSubLocationCtrl.setValue(null);
  }
  displayFn(location?: any): string | undefined {
    return location ? location.name : undefined;
  }
  private _filter(value: string):  Observable<any> {
    //const filterValue = value.toLowerCase();
    if (value === '') return of(this.subLocations);
    return of(this.subLocations
    .filter(l => l.name.toLowerCase().indexOf(value) === 0));
  }
  removeCountry(index) {
    this.messageEvent.emit(index);
  }

}
