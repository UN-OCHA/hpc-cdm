import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'attachment-entry',
  templateUrl: './attachment-entry.component.html',
  styleUrls: ['./attachment-entry.component.scss']
})
export class AttachmentEntryComponent implements OnInit {
  registerForm: FormGroup;

  @Input() operationId: any;
  @Input() gveId: any;
  @Input() entry: any;
  @Input() entryIdx: any;
  title: string;
  fileToUpload: any;
  expanded = false;
  submitted = false;

  constructor(
    private api: ApiService,
    private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      filename: ['', Validators.required]
    });
  }

  ngOnInit() {
    if(!this.entry.id) {
      this.expanded = true;
    }
    if(this.entry) {
      this.registerForm.reset({
        id: this.entry.id,
        name: this.entry.name,
        filename: this.entry.id
      });
      this.setTitle();
    }
  }

  get f() { return this.registerForm.controls; }

  clearErrors() {
    this.submitted = false;
  }

  handleNameChange() {
    this.clearErrors();
    this.setTitle();
  }

  setTitle() {
    const name = this.registerForm.get('name').value;
    this.title = `Form ${this.entryIdx}. ${name}`;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  remove() {
    if(this.entry.id) {
      if(this.operationId) {
        this.api.deleteOperationAttachment(this.entry.id);
      } else if(this.gveId) {
        this.api.deleteGveAttachment(this.entry.id);
      }
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload) {
      this.registerForm.controls['filename'].setValue(this.fileToUpload.name);
    }
  }

  save() {
    this.submitted = true;
    const formData = this.registerForm.value;
    if(this.registerForm.valid) {
      const xentry = {
        id: `CF${formData.id}`,
        name: formData.id,
        file: this.fileToUpload
      };
      if(this.operationId) {
        this.api.saveOperationAttachment(xentry, this.operationId);
        // TODO save and then what?
      } else if(this.gveId) {
        // this.api.saveGveAttachment(xentry, this.gveId);
      }
    }
  }
}
