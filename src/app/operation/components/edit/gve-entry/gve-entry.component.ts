import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  @ViewChild('form') form;

  @Input() entry: any;
  @Input() entryIdx: any;
  @Input() readOnly: boolean;

  title: string;
  expanded = false;

  constructor(
    private api: ApiService,
    public createOperationService: CreateOperationService,
    private toastr: ToastrService,
    private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      abbreviation: ['', Validators.required],
      name: ['', Validators.required],
      comment: [''],
      activationDate: [''],
      filename: ['']
    });
  }

  ngOnInit() {
    // TODO: check to remove with Vincent
    //this.entry.opGoverningEntityVersion.opGoverningEntityId = this.entry.id;
    //this.entry.opEntityPrototypeId = this.entry.opEntityPrototype.id;
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
    //if(this.registerForm.valid) {
      this.api.saveGoverningEntity(this.entry).subscribe((result) => {
        if (this.entry.id) {
          return this.toastr.success('Attachment updated.', 'Attachment updated');
        } else {
          this.createOperationService.operation.opGoverningEntities.push(result);
          return this.toastr.success('Attachment create.', 'Attachment created');
        }
      });
    //}
  }

  remove() {

    if(this.entry.id) {
      this.api.deleteOperationGve(this.entry.id).subscribe(response => {
        if (response.status === 'ok') {
          this.createOperationService.operation.opGoverningEntities.splice(this.createOperationService.operation.opGoverningEntities.indexOf(this.entry.id), 1);
          this.entry.hide = true;
          return this.toastr.warning('Governing entity removed.', 'Governing entity removed');
        }
      });
    }
  }

  removeFile() {
    //All these. just to allow second upload on the same file
    const bkp = Object.assign(this.registerForm.value, {});
    this.form.nativeElement.reset();
    this.fileToUpload = null;
    this.f.abbreviation.setValue(bkp.abbreviation);
    this.f.name.setValue(bkp.name);
    this.f.comments.setValue(bkp.comments);
    this.f.activationDate.setValue(bkp.activationDate);
  }
}
