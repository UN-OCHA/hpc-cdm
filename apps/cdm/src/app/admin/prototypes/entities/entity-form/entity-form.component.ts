import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ApiService, ModeService } from '@hpc/core';
import { ToastrService } from 'ngx-toastr';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'entity-prototype-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  title: String;
  prototype: any;
  operationId: any;
  jsonModel: any;
  public loading = false;

  constructor(
    private location: Location,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private modeService: ModeService,
    private operationService: OperationService,
    private api: ApiService,
    private toastr: ToastrService) {
    this.form = this.fb.group({
      refCode: ['', Validators.required],
      refType: ['', Validators.required]
    });
  }

  setMode(proto:any) {
    this.title = proto ? 'Edit Entity Prototpe' : 'New Entity Prototype';
    if(proto) {
      this.prototype = proto;
      this.form.reset({
        refCode: proto.opEntityPrototypeVersion.refCode,
        refType: proto.opEntityPrototypeVersion.type
      });
    } else {
      this.prototype = {
        operationId: this.operationService.id,
        opEntityPrototypeVersion: {
          value: {},
          refCode:'',
          refType:''
        }
      };
      console.log(this.prototype );
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationId = params.operationId;
      if(params.id) {
        this.modeService.mode = 'edit';
        this.jsonModel = true;
        this.api.getEntityPrototype(params.id).subscribe(proto => {
          this.setMode(proto);
        })
      } else {
        this.modeService.mode = 'add';
        this.setMode(this.injector.get('prototype', null));
      }
    })
  }

  get f() { return this.form.controls; }

  clearErrors = () => {
    this.submitted = false;
  }

  close() {
    this.location.back();
  }

  onJsonChange(event) {
    if(!event || !event.type || event.type !== 'change') {
      this.jsonModel = event;
    }
  }

  validEntry() {

    return this.form.valid && this.jsonModel ;
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      const id = this.prototype && this.prototype.id;
      // TODO: add operation id
      this.prototype.opEntityPrototypeVersion = {
        id: this.prototype.opEntityPrototypeVersion.id,
        opEntityPrototypeId: this.prototype.id,
        refCode: formData.refCode,
        type: formData.refType,
        value: this.jsonModel || this.prototype.opEntityPrototypeVersion.value
      };
      console.log(this.prototype);
      this.api.saveEntityPrototype(this.prototype, id).subscribe((result) => {
        this.toastr.success('Attachment Prototypes is updated');
        this.loading = false;
        this.router.navigate(['/operations', result.operationId, 'eprototypes']);
      },
      err => this.loading = false);
    }
  }
}

// <json-editor [json]="prototype && prototype.opEntityPrototypeVersion.value" (change)="onJsonChange($event)" ></json-editor>
// [ngTemplateOutletContext]="{$implicit: option}">
