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
  loading = false;
  title: String;
  blueprint: any;
  jsonModel: any;
  blueprintTypeOptions: any = [
    { label: 'Operation Blueprint', value: '1', checked: false },
    { label: 'Plan Blueprint', value: '2', checked: false }
  ];

  constructor(
    private service: ModeService,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1024)]]
    });
  }
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id && !params.copy) {
        this.service.mode = 'edit';
        this.api.getBlueprint(params.id).subscribe(bp => {
          this.setMode(bp);
        });
      } else if(params.id && params.copy) {
        this.service.mode = 'copy';
        this.api.getBlueprint(params.id).subscribe(bp => {
          this.setMode(bp);
        });
      } else {
        this.service.mode = 'add';
        this.setMode(this.injector.get('blueprint', null));
      }
    });
  }
  setMode(bp) {
    if(bp) {
      this.blueprint = bp;
      this.form.reset({
        type: bp.type,
        name: bp.name,
        description: bp.description
      });
    }
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
    this.loading = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      formData.model = this.jsonModel;
      // add a checkbox to set active / disabled
      formData.status = 'active';

      const bpId = this.service.mode !== 'copy' && this.blueprint && this.blueprint.id;
      this.api.saveBlueprint(formData, bpId).subscribe(() => {
        this.loading = false;
        this.router.navigate(['/blueprints']);
      });
    }
  }
}
