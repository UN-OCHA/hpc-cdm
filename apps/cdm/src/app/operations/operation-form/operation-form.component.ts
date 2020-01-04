import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
})
export class OperationFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  mode;
  blueprints$ = this.appService.blueprints$;
  emergencies$ = this.appService.emergencies$;
  locations$ = this.appService.locations$;
  maxChars = 400;
  charsUsed = 0;

  constructor(
    private appService: AppService,
    private modeService: ModeService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      blueprint: ['', Validators.required]
    });
  }

  ngOnInit() {
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

  clearErrors() {

  }

  onSubmit() {
    console.log(this.form.value)
  }

  summaryChange(value) {
    this.charsUsed = value.length;
  }
}
