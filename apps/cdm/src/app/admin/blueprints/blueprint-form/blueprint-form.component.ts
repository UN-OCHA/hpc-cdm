import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, ModeService } from '@hpc/core';

@Component({
  selector: 'blueprint-form',
  templateUrl: './blueprint-form.component.html',
  styleUrls: ['./blueprint-form.component.scss']
})
export class BlueprintFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  title: String;
  blueprint: any;
  jsonModel: any;

  constructor(
    private service: ModeService,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  setMode(bp) {
    this.title = bp ? 'Edit Blueprint' : 'New Blueprint';
    if(bp) {
      this.blueprint = bp;
      this.form.reset({
        name: bp.name,
        description: bp.description
      });
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.service.mode = 'edit';
        this.api.getBlueprint(params.id).subscribe(bp => {
          this.setMode(bp);
        });
      } else {
        this.service.mode = 'add';
        this.setMode(this.injector.get('blueprint', null));
      }
    });
  }

  get f() { return this.form.controls; }

  clearErrors = () => {
    this.submitted = false;
  }

  onJsonChange(event) {
    this.jsonModel = event;
  }

  onSubmit() {
    this.submitted = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      formData.model = this.jsonModel;
      // add a checkbox to set active / disabled
      formData.status = 'active';
      const bpId = this.blueprint && this.blueprint.id;
      this.api.saveBlueprint(formData, bpId).subscribe(() => {
        this.router.navigate(['/blueprints']);
      });
    }
  }
}
