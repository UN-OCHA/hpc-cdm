import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { OperationService } from '@cdm/core';
import { ToastrService } from 'ngx-toastr';

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
  public loading = false;

  constructor(
    private location: Location,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
<<<<<<< HEAD
    private appService: AppService,
=======
    private api: ApiService,
    private toastr: ToastrService,
    private operationService: OperationService,
>>>>>>> cdm-dev
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
        operationId: this.operationService.id,
        opAttachmentPrototypeVersion: {
          value: {},
          refCode:'',
          refType:''
        }
      };
      console.log(this.prototype);
    }
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.modeService.mode = data.mode;
    });

    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
<<<<<<< HEAD
        this.appService.loadAttachmentPrototype(params.id);
        this.appService.attachmentPrototype$.subscribe(ap => {
          console.log(ap)
          this.prototype = ap;
          this.form.patchValue({
            refCode: ap.refCode,
            refType: ap.type,
            value: ap.value
          });
        });
=======
        this.modeService.mode = 'edit';
        this.jsonModel = true;
        this.api.getAttachmentPrototype(params.id).subscribe(proto => {
          this.setMode(proto);
        })
>>>>>>> cdm-dev
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
    if(!event || !event.type || event.type !== 'change') {
      this.jsonModel = event;
    }
  }

  validEntry() {

    return this.form.valid && this.jsonModel ;
  }

  close() {
    this.location.back();
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if(!this.form.invalid) {
      const formData = this.form.value;
      const id = this.prototype && this.prototype.id;
      this.prototype.opAttachmentPrototypeVersion = {
        id: this.prototype.opAttachmentPrototypeVersion.id,
        opAttachmentPrototypeId: this.prototype.id,
        refCode: formData.refCode,
        type: formData.refType,
<<<<<<< HEAD
        value: this.jsonModel || this.prototype.value
      };
      // TODO vimago what service?
      // this.api.saveAttachmentPrototype(this.prototype, id).subscribe((result) => {
      //
      //   this.router.navigate(['/operations',result.operationId,'aprototypes']);
      // });
=======
        value: this.jsonModel
      };
      this.api.saveAttachmentPrototype(this.prototype, id).subscribe((result) => {

        this.toastr.success('Attachment Prototypes is updated');
        this.loading = false;
        this.router.navigate(['/operations',result.operationId,'aprototypes']);
      },
      err => this.loading = false);
>>>>>>> cdm-dev
    }
  }
}
