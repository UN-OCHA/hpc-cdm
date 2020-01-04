import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';
import { ModeService } from '@hpc/core';

@Component({
  selector: 'plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: [ './plan-form.component.scss' ]
})
export class PlanFormComponent implements OnInit {
  op: Operation;
  form: FormGroup;

  constructor(
    private modeService: ModeService,
    private operation: OperationService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.modeService.mode = 'add';
    this.operation.operation$.subscribe(op => {
      this.op = op;
    });
  }
}
