import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'blueprint-form',
  templateUrl: './blueprint-form.component.html',
  styleUrls: ['./blueprint-form.component.scss']
})
export class BlueprintFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  submitted = false;
  loading = false;
  title: String;
  blueprint$ = this.appService.blueprint$;
  jsonModel: any;
<<<<<<< HEAD
  blueprintType: string = 'operation';
=======
  blueprintTypeOptions: any = [
    { label: 'Operation Blueprint', value: '1', checked: false },
    { label: 'Plan Blueprint', value: '2', checked: false }
  ];
>>>>>>> cdm-dev

  constructor(
    private appService: AppService,
    private modeService: ModeService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1024)]]
    });
  }
<<<<<<< HEAD

=======
>>>>>>> cdm-dev
  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.modeService.mode = data.mode;
    });

    this.activatedRoute.params.subscribe(params => {
<<<<<<< HEAD
      if(params.id) {
        this.loading = true;
        this.appService.loadBlueprint(params.id);
        this.appService.blueprint$.subscribe(bp => {
          // this.form.patchValue({name: bp.name, description: bp.description});
          this.form.patchValue(bp);
          this.loading = false;
        });
=======
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
>>>>>>> cdm-dev
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

  // setBlueprintType(type) {
  //   const bptype = type === 'operation' ? 1 : 2;
  //   this.modeService.mode = `${this.modeService.mode}${bptype}`;
  // }

  ngOnDestroy() {
    // this.activatedRoute.params.unsubscribe();
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
<<<<<<< HEAD
      // const bpId = this.blueprint && this.blueprint.id;
      // TODO vimago
      // this.api.saveBlueprint(formData, bpId).subscribe(() => {
      //   this.router.navigate(['/blueprints']);
      // });
=======

      const bpId = this.service.mode !== 'copy' && this.blueprint && this.blueprint.id;
      this.api.saveBlueprint(formData, bpId).subscribe(() => {
        this.loading = false;
        this.router.navigate(['/blueprints']);
      });
>>>>>>> cdm-dev
    }
  }
}
