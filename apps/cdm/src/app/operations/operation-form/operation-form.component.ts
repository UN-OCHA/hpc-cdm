import { Component, OnInit,ViewChild, AfterViewInit,ViewChildren,QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@hpc/core';
import { OperationService } from '@cdm/core';
import { UIModule } from '@hpc/ui';
import { EmergencySelectComponent } from 'libs/ui/src/lib/emergency-select/emergency-select.component';
import { LocationSelectComponent } from 'libs/ui/src/lib/location-select/location-select.component';
import { result } from 'lodash-es';

@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
})
export class OperationFormComponent implements OnInit,AfterViewInit {
  @ViewChild(EmergencySelectComponent, {static: false}) emergency: EmergencySelectComponent;
  @ViewChildren(LocationSelectComponent) location: QueryList<any>;
  form: FormGroup;
  blueprints = [];
  editMode = false;
  Locations = ['location1'];

  constructor(
    private operationService: OperationService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private api: ApiService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      blueprint: ['', Validators.required]
    });
  }

  ngOnInit() {
     this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationService.mode = 'edit';
        this.editMode = true;
        this.operationService.loadOperation(params.id).subscribe(op=> {
          this.form.setValue({
name: op.name,
description: op.description,
blueprint:1
          });
        });
      } else {
        this.operationService.mode = 'add';
        this.api.getBlueprints().subscribe(blueprints => {
          this.blueprints = blueprints;
        });
      }
    });
}
ngAfterViewInit() {
}

  clearErrors() {

  }

  onSubmit() {
    let operation= {
      name: this.form.value.name,
      description: this.form.value.description,
      blueprintId: this.form.value.blueprint.id,
      emergencies: this.emergency.selectedValues,
      locations: this.getLocations()
    };
    this.api.createOperation(operation).subscribe(result =>{
      console.log(result);
    })

//console.log(operation);

  }
  getLocations() : any[] {
    let locations = [];
     this.location.forEach(element => {
     locations.push(element.optionCtrl.value.id);
     if(element.selectedValues.length > 0) {
      element.selectedValues.forEach(location => {
        locations.push(location);
      });
     }
      });    
    return locations;
  }
  addCountry() {
    const count = this.Locations.length;
    this.Locations.push('location'+count+1);
  }
  removeCountry($event) {
    this.Locations.splice($event,1);
  }
}
