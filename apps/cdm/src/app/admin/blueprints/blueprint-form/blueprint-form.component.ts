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
  title: String;
  blueprint$ = this.appService.blueprint$;
  jsonModel: any;
  blueprintType: string = 'operation';

  constructor(
    private appService: AppService,
    private modeService: ModeService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.modeService.mode = data.mode;
    });

    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.loading = true;
        this.appService.loadBlueprint(params.id);
        this.appService.blueprint$.subscribe(bp => {
          this.form.patchValue(bp);
          this.loading = false;
        });
      }
    });
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
    if(!this.form.invalid) {
      const formData = this.form.value;
      formData.model = this.jsonModel;
      // add a checkbox to set active / disabled
      formData.status = 'active';
      // const bpId = this.blueprint && this.blueprint.id;
      // TODO vimago
      // this.api.saveBlueprint(formData, bpId).subscribe(() => {
      //   this.router.navigate(['/blueprints']);
      // });
    }
  }
}
