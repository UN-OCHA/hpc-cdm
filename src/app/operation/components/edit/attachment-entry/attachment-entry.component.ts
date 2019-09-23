import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { Attachment } from 'app/operation/models/view.operation.model';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'attachment-entry',
  templateUrl: './attachment-entry.component.html',
  styleUrls: ['./attachment-entry.component.scss']
})
export class AttachmentEntryComponent implements OnInit {

  @Input() operationId: any;
  @Input() gveId: any;
  @Input() entry: Attachment;
  @Input() entryIdx: any;

  @Output() onRefreshList = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  title: string;
  fileToUpload: any;
  filePath: any;
  expanded = false;
  submitted = false;
  uploading = false;
  @ViewChild('attachmentForm') public attachmentForm: NgForm;

  constructor(
    private api: ApiService,
    public createOperationService: CreateOperationService,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    if(!this.entry.id) {
      this.expanded = true;
    }
    if(this.entry) {
      this.setTitle();
    }
  }
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
    this.uploading = true;
    this.fileToUpload = files.item(0);
    if(this.fileToUpload) {
      const xentry = {
        id: `CF${this.entry.opAttachmentVersion.customReference}`,
        name: this.entry.opAttachmentVersion.customReference,
        file: this.fileToUpload
      };
      this.api.saveOperationAttachmentFile(xentry).subscribe(result=> {
        this.entry.opAttachmentVersion.value.file = result.file;
        this.uploading = false;
      });
    }
  }

  save(){
    this.submitted = true;
    if(this.attachmentForm.valid) {
        this.api.saveOperationAttachment(this.entry,this.operationId).subscribe((result:Attachment) => {
          Object.assign(this.entry, result);
          if (this.entry.id) {
            return this.toastr.success('Attachment updated.', 'Attachment updated');
          }
          return this.toastr.success('Attachment created.', 'Attachment created');
        });
    }
  }
}
