import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { AppService, ModeService } from '@hpc/core';

@Component({
  selector: 'attachment-prototype-form',
  templateUrl: './attachment-form.component.html',
  styleUrls: ['./attachment-form.component.scss']
})
export class AttachmentFormComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  prototype: any;
  jsonModel: any;
  operationId: any;

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

  setMode(proto) {
    if(proto) {
      this.prototype = proto;
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
    this.activatedRoute.data.subscribe(data => {
      this.modeService.mode = data.mode;
    });

    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.appService.loadAttachmentPrototype(params.id);
        this.appService.attachmentPrototype$.subscribe(ap => {
          this.prototype = ap;
          this.form.reset({
            refCode: ap.refCode,
            refType: ap.type
          });
        });
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
      // TODO vimago what service?
      // this.api.saveAttachmentPrototype(this.prototype, id).subscribe((result) => {
      //
      //   this.router.navigate(['/operations',result.operationId,'aprototypes']);
      // });
    }
  }
}
