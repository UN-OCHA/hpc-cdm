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
        refCode: proto.refCode,
        refType: proto.type
      });
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
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
      this.api.saveAttachmentPrototype({
        refCode: formData.refCode,
        type: formData.refType,
        value: this.jsonModel
      }, id).subscribe(() => {
        this.router.navigate(['/admin/attachmentprotos']);
      });
    }
  }
}
