import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'entity-prototype-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  title: String;
  prototype$ = this.appService.entityPrototype$;
  operation$ = this.appService.operation$;
  jsonModel: any;

  constructor(
    private location: Location,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private appService: AppService,
    private modeService: ModeService) {
    this.form = this.fb.group({
      refCode: ['', Validators.required],
      refType: ['', Validators.required]
    });
  }

  setMode(proto:any) {
    // this.title = proto ? 'Edit Entity Prototpe' : 'New Entity Prototype';
    // if(proto) {
    // } else {
    //   this.prototype = {
    //     operationId: this.operationId,
    //     opEntityPrototypeVersion: {
    //       value: {},
    //       refCode:'',
    //       refType:''
    //     }
    //   };
    // }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
    //   if(params.operationId) {
    //     this.operationId = params.operationId;
    //   }
      if(params.id) {
        this.modeService.mode = 'edit';
        this.appService.loadEntityPrototype(params.id);
        this.appService.entityPrototype$.subscribe(ep => {
          this.form.reset({
            refCode: ep.refCode,
            refType: ep.type
          });
        });
      } else {
        this.modeService.mode = 'add';
    //     this.setMode(this.injector.get('prototype', null));
      }
    });
  }

  get f() { return this.form.controls; }

  clearErrors = () => {
    this.submitted = false;
  }

  close() {
    this.location.back();
  }

  onJsonChange(event) {
    this.jsonModel = event;
  }

  onSubmit() {
    // this.submitted = true;
    // if(!this.form.invalid) {
    //   const formData = this.form.value;
    //   const id = this.prototype && this.prototype.id;
    //   // TODO: add operation id
    //   this.prototype.opEntityPrototypeVersion = {
    //     id: this.prototype.opEntityPrototypeVersion.id,
    //     opEntityPrototypeId: this.prototype.id,
    //     refCode: formData.refCode,
    //     type: formData.refType,
    //     value: this.jsonModel || this.prototype.opEntityPrototypeVersion.value
    //   };
    //   // TODO vimago what service?
    //   // this.api.saveEntityPrototype(this.prototype, id).subscribe((result) => {
    //   //   this.router.navigate(['/operations', result.operationId, 'eprototypes']);
    //   // });
    // }
  }
}

// <json-editor [json]="prototype && prototype.opEntityPrototypeVersion.value" (change)="onJsonChange($event)" ></json-editor>
// [ngTemplateOutletContext]="{$implicit: option}">
