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
  @Input() entry: any;
  @Input() entryIdx: any;
  title: string;
  fileToUpload: any;
  expanded = false;
  submitted = false;

  constructor(
    private api: ApiService,
    private fb: FormBuilder) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      filename: ['', Validators.required]
    });

    this.title = `Form ${this.entryIdx}.`;
    if(this.entry.id) {
      this.title += ` ${this.entry.name}`;
    }
    if(!this.entry.id) {
      this.expanded = true;
    }
  }

  get f() { return this.registerForm.controls; }

  clearErrors = () => {
    this.submitted = false;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  remove() {
    if(this.entry.id) {
      this.api.deleteOperationAttachment(this.entry.id);
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
      this.api.saveOperationAttachment({
        id: formData.id,
        name: formData.id,
        file: this.fileToUpload
      }, this.operationId);
    }
  }
}
