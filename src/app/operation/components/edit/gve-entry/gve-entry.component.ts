import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
//import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'gve-entry',
  templateUrl: './gve-entry.component.html',
  styleUrls: ['./gve-entry.component.scss']
})
export class GveEntryComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  fileToUpload: any;

  @ViewChild('gveForm') public gveForm: NgForm;

  @Input() entry: any;
  @Input() entityPrototype: any;
  @Input() entryIdx: any;
  @Input() readOnly: boolean;

  @Output() onRefreshList = new EventEmitter();
  @Output() onDelete = new EventEmitter();


  title: string;
  expanded = false;

  constructor(
    private api: ApiService,
    public createOperationService: CreateOperationService,
    private toastr: ToastrService,
    private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      customReference: ['', Validators.required],
      name: ['', Validators.required],
      comment: [''],
      activationDate: [''],
      filename: ['']
    });
  }

  ngOnInit() {
    this.title = '';

    if(this.entry && this.entry.opGoverningEntityVersion.activationDate) {
      this.entry.opGoverningEntityVersion.activationDate = moment(this.entry.opGoverningEntityVersion.activationDate).toDate();
    }
    if(this.entry && this.entry.opGoverningEntityVersion.customReference) {
      this.title += `${this.entry.opGoverningEntityVersion.name}`;
    }
    if(!this.entry || !this.entry.opGoverningEntityVersion.name) {
      this.expanded = true;
    }
  }

  get f() { return this.registerForm.controls; }
  clearErrors = () => {
    this.submitted = false;
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload) {
      this.f.filename.setValue(this.fileToUpload.name);
    }
  }

  save() {
    this.submitted = true;
    const formData = this.registerForm.value;
    formData.file = this.fileToUpload

    this.submitted = true;
    if(this.gveForm.valid) {
      this.api.saveGoverningEntity(this.entry).subscribe((result:any) => {
        if (this.entry.id) {
          const opAttachments = this.entry.opAttachments || [];
          Object.assign(this.entry, result);
          this.entry.opAttachments = opAttachments;

          if(this.entry && this.entry.opGoverningEntityVersion.activationDate) {
            this.entry.opGoverningEntityVersion.activationDate = moment(this.entry.opGoverningEntityVersion.activationDate).toDate();
          }
          return this.toastr.success('Governing entity updated.', 'Governing entity updated');
        } else {
          Object.assign(this.entry, result);
          this.entry.opAttachments = [];

          if(this.entry && this.entry.opGoverningEntityVersion.activationDate) {
            this.entry.opGoverningEntityVersion.activationDate = moment(this.entry.opGoverningEntityVersion.activationDate).toDate();
          }

          return this.toastr.success('Governing entity create.', 'Governing entity created');
        }
      });
    }
  }

  remove() {
    this.onDelete.emit(this.entry);
  }

  removeFile() {
    //All these. just to allow second upload on the same file
    const bkp = Object.assign(this.registerForm.value, {});
    this.fileToUpload = null;
    this.f.abbreviation.setValue(bkp.abbreviation);
    this.f.name.setValue(bkp.name);
    this.f.comments.setValue(bkp.comments);
    this.f.activationDate.setValue(bkp.activationDate);
  }
}
