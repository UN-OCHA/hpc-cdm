<<<<<<< HEAD
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService, ModeService } from '@hpc/core';
=======
import { Component, OnInit,ViewChild, ViewChildren,QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@hpc/core';
import { OperationService } from '@cdm/core';
import { EmergencySelectComponent } from 'libs/ui/src/lib/emergency-select/emergency-select.component';
import { LocationSelectComponent } from 'libs/ui/src/lib/location-select/location-select.component';
import { ToastrService } from 'ngx-toastr';
>>>>>>> cdm-dev

@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
})
<<<<<<< HEAD
export class OperationFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  mode;
  blueprints$ = this.appService.blueprints$;
  emergencies$ = this.appService.emergencies$;
  locations$ = this.appService.locations$;

  constructor(
    private appService: AppService,
    private modeService: ModeService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute) {
=======
export class OperationFormComponent implements OnInit {
  @ViewChild(EmergencySelectComponent, {static: false}) emergency: EmergencySelectComponent;
  @ViewChildren(LocationSelectComponent) location: QueryList<any>;
  form: FormGroup;
  oprationId: 0;
  loading = false;
  blueprints = [];
  editMode = false;
  Locations = [];
  submitted;

  constructor(
    private router: Router,
    private operationService: OperationService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private api: ApiService) {
>>>>>>> cdm-dev
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      emergencies: ['', Validators.required],
      locations: ['', Validators.required],
      blueprint: ['', Validators.required]
    });
  }

  ngOnInit() {
<<<<<<< HEAD
    this.activatedRoute.params.subscribe(params => {
      this.appService.loadEmergenciesAndLocations();
      if(params.id) {
        this.mode = 'edit';
      } else {
        this.mode = 'add';
        this.appService.loadBlueprints();
      }
    });
  }

  ngOnDestroy() {
    // this.activatedRoute.params.unsubscribe();
  }
=======
     this.activatedRoute.params.subscribe(params => {
       console.log(params);
      if(params.id) {
        this.oprationId = params.id;
        this.operationService.mode = 'edit';
        this.editMode = true;
        this.operationService.loadOperation(params.id).subscribe(op=> {
          console.log(op);
          this.form.setValue({
                  id: op.id,
                  name: op.name,
                  description: op.description,
                  blueprint: 0
          });
          this.Locations = [];
          if(op.emergencies.length){
            op.emergencies.forEach(emergency => {
              this.emergency.displayValues.push(emergency.name);
              this.emergency.selectedValues.push(emergency.id);
            });
          }
          const adminLevel0locations = op.locations.map(loc => {
            if(loc.adminLevel == 0) {
              let location = {};
              location = loc;
              location['sublocations'] = op.locations.filter(subLoc => subLoc.parentId == loc.id);
              return location;
            }
            }).filter(function (el) {
              return el != null;
            });
          this.Locations = adminLevel0locations;
        });
      } else {
        this.operationService.mode = 'add';
        this.api.getBlueprints().subscribe(blueprints => {
          this.blueprints = blueprints;
        });
        this.Locations = ['location1'];
      }

    });
}

>>>>>>> cdm-dev

  clearErrors() {
  }

  onEmergenciesChange(emergencies) {
    this.form.patchValue({emergencies});
  }

  onLocationsChange(locations) {
    this.form.patchValue({locations});
  }

  onBlueprintChange(blueprint) {
    this.form.patchValue({blueprint});
  }

<<<<<<< HEAD
  onSubmit() {
    console.log('======================================');
    console.log(this.form.value);
=======
  onSubmit(isContinue = true) {
    this.loading = true;
    if(!this.oprationId){
      let operation= {
        name: this.form.value.name,
        description: this.form.value.description,
        blueprintId: this.form.value.blueprint.id,
        emergencies: this.emergency.selectedValues,
        locations: this.getLocations()
      };
      this.api.createOperation(operation).subscribe(result =>{
        this.loading = false;
        this.toastr.success('Operation is created');
        if(isContinue) {
          this.router.navigate(['/operations']);
        } else {
          this.form.reset();
          this.emergency.displayValues = [];
          this.emergency.selectedValues = [];
          this.Locations = ['location1'];
        }

      })
    } else {
      let operation= {
        id: this.form.value.id,
        "operationVersion": {
          name: this.form.value.name,
          description: this.form.value.description,
          blueprintId: this.form.value.blueprint.id,
          },
        emergencies: this.emergency.selectedValues,
        locations: this.getLocations()

    };
      this.api.saveOperation(operation).subscribe(result =>{
        this.loading = false;
        this.toastr.success('Operation is updated');
        if(isContinue) {
          this.router.navigate(['/operations']);
        }
      })
    }
  }

  get f() { return this.form.controls; }

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
>>>>>>> cdm-dev
  }
}
