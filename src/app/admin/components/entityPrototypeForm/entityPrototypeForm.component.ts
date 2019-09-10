import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'entity-prototype-form',
  templateUrl: './entityPrototypeForm.component.html',
  styleUrls: ['./entityPrototypeForm.component.scss']
})
export class EntityPrototypeFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  title: String;
  prototype: any;
  jsonModel: any;

  constructor(
    private location: Location,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService) {
    this.form = this.fb.group({
      refCode: ['', Validators.required],
      refType: ['', Validators.required]
    });
  }

  setMode(proto) {
    this.title = proto ? 'Edit Entity Prototpe' : 'New Entity Prototype';
    if(proto) {
      this.prototype = proto;
      this.form.reset({
        refCode: proto.opEntityPrototypeVersion.refCode,
        refType: proto.opEntityPrototypeVersion.type
      });
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.api.getEntityPrototype(params.id).subscribe(proto => {
          this.setMode(proto);
        })
      } else {
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
    this.jsonModel = event;
  }

  onSubmit() {
    this.submitted = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      const id = this.prototype && this.prototype.id;
      this.prototype.opEntityPrototypeVersion = {
        refCode: formData.refCode,
        type: formData.refType,
        value: this.jsonModel
      };
      this.api.saveEntityPrototype(this.prototype, id).subscribe((result) => {
        this.router.navigate(['/admin/operations',result.operationId,'entityprotos']);
      });
    }
  }
}
