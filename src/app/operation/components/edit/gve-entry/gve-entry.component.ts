import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';
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
  title: string;
  expanded = false;

  constructor(
    private api: ApiService,
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

    if(!this.registerForm.invalid) {
      this.api.saveOperationGve(formData, this.entry && this.entry.id);
    }
  }

  remove() {
    this.api.deleteOperationGve(this.entry.id);
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
