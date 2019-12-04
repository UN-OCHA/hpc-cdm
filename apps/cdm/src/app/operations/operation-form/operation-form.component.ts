import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@hpc/core';

@Component({
  selector: 'operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
})
export class OperationFormComponent implements OnInit {
  form: FormGroup;
  blueprints = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.api.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints;
    });
  }
}
