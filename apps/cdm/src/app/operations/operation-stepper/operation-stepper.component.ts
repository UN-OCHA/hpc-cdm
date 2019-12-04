import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-stepper',
  templateUrl: './operation-stepper.component.html',
  styleUrls: [ './operation-stepper.component.scss' ]
})
export class OperationStepperComponent implements OnInit {
  form: FormGroup;

  constructor(
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationService.loadOperation(params.id).subscribe(op => {
        this.form = new FormGroup({
          'operationDetails': new FormGroup({
            'name': new FormControl('name', Validators.required),
            'description': new FormControl(null, Validators.required),
            'emergency': new FormControl(null, Validators.required),
            'location': new FormControl(null, Validators.required),
            'blueprint': new FormControl(null, Validators.required),
          }),
          'clusterDetails': new FormGroup({
            'name': new FormControl('name', Validators.required),
            'description': new FormControl(null, Validators.required),
            'emergency': new FormControl(null, Validators.required),
            'location': new FormControl(null, Validators.required),
            'blueprint': new FormControl(null, Validators.required),
          })
        });
      });
    });
  }
}
