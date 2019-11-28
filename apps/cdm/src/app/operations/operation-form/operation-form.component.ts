import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: [ './operation-form.component.scss' ]
})
export class OperationFormComponent implements OnInit {
  registrationForm: FormGroup;

  constructor(private operation: OperationService) {}

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'operationDetails': new FormGroup({
        'name': new FormControl(null, Validators.required),
        'description': new FormControl(null, Validators.required),
        'emergency': new FormControl(null, Validators.required),
        'location': new FormControl(null, Validators.required),
        'blueprint': new FormControl(null, Validators.required),
      }),
      'personalDetails': new FormGroup({
        'firstname': new FormControl(null, Validators.required),
        'mi': new FormControl(null),
        'lastname': new FormControl(null, Validators.required),
      }),
      'contactDetails': new FormGroup({
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'phone': new FormControl(null)
      })
    });
  }
}
