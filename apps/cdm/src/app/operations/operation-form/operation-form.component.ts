import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  title = '';
  editMode = false;
  // blueprint;

  constructor(
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
      console.log(params)
      if(params.id) {
        this.title = 'Edit Operation';
        this.editMode = true;
      } else {
        this.title = 'New Operation';
        this.api.getBlueprints().subscribe(blueprints => {
          this.blueprints = blueprints;
        });
      }
    });
  }

  clearErrors() {

  }

  onSubmit() {
    console.log(this.form.value)
  }
}
