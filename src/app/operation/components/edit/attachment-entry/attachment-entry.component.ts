import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';

import { ToastrService } from 'ngx-toastr';

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

  @Output() onRefreshList = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  title: string;
  fileToUpload: any;
  filePath: any;
  expanded = false;
  submitted = false;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      filename: ['', Validators.required]
    });
  }

  ngOnInit() {
    if(!this.entry.id) {
      this.expanded = true;
    }
    if(this.entry) {
      this.registerForm.reset({
        filename: this.entry.opAttachmentVersion.value.file || ''
      });
      this.filePath = this.entry.opAttachmentVersion.value.file;
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
    const name = this.entry.opAttachmentVersion.value.name;
    const customReference = this.entry.opAttachmentVersion.customReference;
    this.title = `Form ${customReference}. ${name}`;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  remove() {
    if(this.entry.id) {
      this.onDelete.emit(this.entry);
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload) {
      this.registerForm.controls['filename'].setValue(this.fileToUpload.name);

      const xentry = {
        id: `CF${this.entry.opAttachmentVersion.customReference}`,
        name: this.entry.opAttachmentVersion.customReference,
        file: this.fileToUpload
      };
      this.api.saveOperationAttachmentFile(xentry).subscribe(result=> {
        this.entry.opAttachmentVersion.value.file = result.file;
      });
    }
  }

  save(){
    this.submitted = true;
    if(this.registerForm.valid) {
        this.api.saveOperationAttachment(this.entry,this.operationId).subscribe((result) => {
          if (this.entry.id) {
            return this.toastr.success('Attachment updated.', 'Attachment updated');
          }
          this.entry = result;
          if (this.gveId) {
            this.onRefreshList.emit();
          }
          return this.toastr.success('Attachment created.', 'Attachment created');
        });
    }
  }
}
