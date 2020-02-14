import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

<<<<<<< HEAD
import { AppService, ModeService } from '@hpc/core';
=======
import { ApiService, ModeService } from '@hpc/core';
import { ToastrService } from 'ngx-toastr';
import { OperationService } from '@cdm/core';
>>>>>>> cdm-dev

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
  public loading = false;

  constructor(
    private location: Location,
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
<<<<<<< HEAD
    private appService: AppService,
    private modeService: ModeService) {
=======
    private modeService: ModeService,
    private operationService: OperationService,
    private api: ApiService,
    private toastr: ToastrService) {
>>>>>>> cdm-dev
    this.form = this.fb.group({
      refCode: ['', Validators.required],
      refType: ['', Validators.required]
    });
  }

  setMode(proto:any) {
<<<<<<< HEAD
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
=======
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
>>>>>>> cdm-dev
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
<<<<<<< HEAD
      if(params.id) {
        this.modeService.mode = 'edit';
        this.appService.loadEntityPrototype(params.id);
        this.appService.entityPrototype$.subscribe(ep => {
          this.form.reset({
            refCode: ep.refCode,
            refType: ep.type,
            value: ep.value
          });
        });
=======
      this.operationId = params.operationId;
      if(params.id) {
        this.modeService.mode = 'edit';
        this.jsonModel = true;
        this.api.getEntityPrototype(params.id).subscribe(proto => {
          this.setMode(proto);
        })
>>>>>>> cdm-dev
      } else {
        this.modeService.mode = 'add';
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
    if(!event || !event.type || event.type !== 'change') {
      this.jsonModel = event;
    }
  }

  validEntry() {

    return this.form.valid && this.jsonModel ;
  }

  onSubmit() {
<<<<<<< HEAD
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
=======
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
>>>>>>> cdm-dev
  }
}

// <json-editor [json]="prototype && prototype.opEntityPrototypeVersion.value" (change)="onJsonChange($event)" ></json-editor>
// [ngTemplateOutletContext]="{$implicit: option}">
