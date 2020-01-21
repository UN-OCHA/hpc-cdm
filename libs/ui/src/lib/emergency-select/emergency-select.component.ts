import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '@hpc/core';


@Component({
  selector: 'emergency-select',
  templateUrl: 'emergency-select.component.html',
  styleUrls: ['emergency-select.component.scss']
})
export class EmergencySelectComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA]; optionCtrl = new FormControl();
  filteredOptions: Observable<any>;
  displayValues: any[] = [];
  selectedValues: any[] = [];

  @ViewChild('optionInput', { static: false }) optionInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    private api: ApiService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      mergeMap((value: string | null) =>
        value && value.length > 2 ? this.api.autocompleteEmergency(value) : []));

  }

  changeTypeaheadNoResults(e: boolean) {
    // this.typeaheadNoResults = e;
  }

  onDeleteEmergency(idx: any) {
    // this.createOperationService.operation.emergencies.splice(idx, 1);
  }

  checkValidity() {
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
    let index = this.displayValues.indexOf(value);
    if (index >= 0) {
      this.displayValues.splice(index, 1);
      this.selectedValues.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void { // private _filter(value: string): Observable<any[]> {
    this.displayValues.push(event.option.viewValue);
    this.selectedValues.push(event.option.value);
    this.optionInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

}
