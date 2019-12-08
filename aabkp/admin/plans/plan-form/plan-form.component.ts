import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService, OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';

@Component({
  selector: 'plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: [ './plan-form.component.scss' ]
})
export class PlanFormComponent implements OnInit {
  op: Operation;
  form: FormGroup;

  constructor(
    private operation: OperationService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
  }
}
