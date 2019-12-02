import { Component, Input, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { ApiService } from '@hpc/core';
import { Observable } from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'location-select',
  templateUrl: 'location-select.component.html',
  styleUrls: ['location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {
  selectedLocationName = '';
  locations: Observable<any>;
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  typeaheadNoResults = false;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.locations = Observable
      .create((observer: any) => observer.next(this.selectedLocationName))
      .pipe(mergeMap((token: string) => this.api.autocompleteLocation(token)));
  }

  // locationTypeaheadOnSelect(e: TypeaheadMatch) {
  //   // this.createOperationService.operation.locations.push(e.item);
  //   this.selectedLocationName = '';
  // }

  onDeleteLocation(idx:any) {
    // this.createOperationService.operation.locations.splice(idx, 1);
  }
}

// http://service.hpc.vm/v1/location/autocomplete/yem?userid=alex@example.com_1485421117650


// <input [(ngModel)]="selectedLocationName"
//        [typeahead]="dataSourceLocation"
//        (typeaheadOnSelect)="locationTypeaheadOnSelect($event)"
//        (typeaheadNoResults)="changeTypeaheadNoResults($event)"
//        typeaheadMinLength="3"
//        typeaheadOptionField="name"
//        (change)="checkValidity()"
//        [placeholder]="((locations.length) ?  'operation-edit.basic-info.add-location2' : 'operation-edit.basic-info.add-location') | translate"
//        name="locationName"
//        class="form-control inputStart"
//        [required]="locations.length === 0"
//        autocomplete="off">
// <div *ngIf="typeaheadNoResults" class="" style="">
//   <i class="fa fa-remove"></i>{{ 'No Results Found' | translate }}
// </div>
//
// <ul class="list-group" *ngFor="let location of locations; let index = index;">
//   <li class="list-group-item">{{ location.name }}
//     <i class="material-icons remove-org clickable"
//       (click)="onDeleteLocation(index)">clear
//     </i>
//   </li>
// </ul>
