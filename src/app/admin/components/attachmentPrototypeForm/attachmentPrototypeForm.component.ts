import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'attachment-prototype-form',
  templateUrl: './attachmentPrototypeForm.component.html',
  styleUrls: ['./attachmentPrototypeForm.component.scss']
})
export class AttachmentPrototypeFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  title: String;
  prototype: any;
  jsonModel: any;
  operationId: any;

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
    this.title = proto ? 'Edit Attachment Prototpe' : 'New Attachment Prototype';
    if(proto) {
      this.prototype = proto;
      this.form.reset({
        refCode: proto.opAttachmentPrototypeVersion.refCode,
        refType: proto.opAttachmentPrototypeVersion.type
      });
    } else {
      this.prototype = {
        operationId: this.operationId,
        opAttachmentPrototypeVersion: {
          value: {},
          refCode:'',
          refType:''
        }
      };
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.operationId) {
        this.operationId = params.operationId;
      }
      if(params.id) {
        this.api.getAttachmentPrototype(params.id).subscribe(proto => {
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

  onJsonChange(event) {
    this.jsonModel = event;
  }

  close() {
    this.location.back();
  }

  onSubmit() {
    this.submitted = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      const id = this.prototype && this.prototype.id;
      this.prototype.opAttachmentPrototypeVersion = {
        id: this.prototype.opAttachmentPrototypeVersion.id,
        opAttachmentPrototypeId: this.prototype.id,
        refCode: formData.refCode,
        type: formData.refType,
        value: this.jsonModel || this.prototype.opAttachmentPrototypeVersion.value
      };
      this.api.saveAttachmentPrototype(this.prototype, id).subscribe((result) => {

        this.router.navigate(['/admin/operations',result.operationId,'attachmentprotos']);
      });
    }
  }
}
