import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModeService } from '@hpc/core';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'participant-form',
  templateUrl: './participant-form.component.html',
  styleUrls: [ './participant-form.component.scss' ]
})
export class ParticipantFormComponent implements OnInit {
  form: FormGroup;
  id;

  constructor(
    private operationService: OperationService,
    private service: ModeService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
    this.id = this.operationService.id;
  }

  ngOnInit() {
    this.service.mode = 'add';
  }

  onSubmit() {
  }
}
