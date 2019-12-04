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
  selector: 'emergency-select',
  templateUrl: 'emergency-select.component.html',
  styleUrls: ['emergency-select.component.scss']
})
export class EmergencySelectComponent implements OnInit {
  // emergencies: Observable<any>;
  selectedEmergencyName = '';
  // typeaheadNoResults = false;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  optionCtrl = new FormControl();
  filteredOptions: Observable<string[]>;
  values: string[] = ['Lemon'];
  options: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('optionInput', {static: false}) optionInput: ElementRef<HTMLInputElement>;
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
    // this.emergencies = Observable
    //   .create((observer: any) => observer.next(this.selectedEmergencyName))
    //   .pipe(mergeMap((token: string) => this.api.autocompleteEmergency(token)));

    // this.api.autocompleteEmergency('').subscribe(results => {
    //   console.log(results)
    // })
  }

  changeTypeaheadNoResults(e: boolean) {
    // this.typeaheadNoResults = e;
  }

  // emergencyTypeaheadOnSelect(e: TypeaheadMatch) {
  //   // this.createOperationService.operation.emergencies.push(e.item);
  //   this.selectedEmergencyName = '';
  // }

  onDeleteEmergency(idx:any) {
    // this.createOperationService.operation.emergencies.splice(idx, 1);
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
    // Add emergency only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add emergency
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
    this.optionInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-filter:'+value.length)
    // if(value.length >= 3) {
      const filterValue = value.toLowerCase();
      // this.filteredOptions = ['one'];
      return this.options
        .filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    // } else {
    //   this.filteredOptions = [];
    //   return this.options = [];
    // }
  }
}


// http://service.hpc.vm/v1/object/autocomplete/emergency/syr?userid=alex@example.com_1485421117650


// <section>
//   <div class="form-group">
//     <label *ngIf="label">Emergencies<i *ngIf="required" class="text-danger">*</i></label>
//     <input [typeahead]="dataSourceEmergency"
//            (typeaheadOnSelect)="emergencyTypeaheadOnSelect($event)"
//            (typeaheadNoResults)="changeTypeaheadNoResults($event)"
//            typeaheadMinLength="3"
//            typeaheadOptionField="name"
//            (change)="checkValidity()"
//            [placeholder]="((emergencies.length) ?  'operation-edit.basic-info.add-emergency2' : 'operation-edit.basic-info.add-emergency')"
//            name="emergencyName"
//            class="form-control inputStart"
//            [required]="emergencies.length === 0"
//            autocomplete="off">
//     <div *ngIf="typeaheadNoResults" class="" style="">
//       <i class="fa fa-remove"></i>{{ 'No Results Found' }}
//     </div>
//
//     <ul class="list-group" *ngFor="let emergency of emergencies; let index = index;">
//       <li class="list-group-item">{{ emergency.name }}
//         <i class="material-icons remove-org clickable"
//           (click)="onDeleteEmergency(index)">clear
//         </i>
//       </li>
//     </ul>
//   </div>
// </section>
