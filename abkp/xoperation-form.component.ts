import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: [ './operation-form.component.scss' ]
})
export class OperationFormComponent implements OnInit {
  operationForm: FormGroup;

  constructor(
    private operation: OperationService,
    private fb: FormBuilder) {}

  ngOnInit() {
    this.operationForm = new FormGroup({
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
  }
}
