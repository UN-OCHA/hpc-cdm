import { Component, OnInit, Input } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';

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
  title: string;
  fileToUpload: any;
  filePath: any;
  expanded = false;
  submitted = false;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private createOperationService: CreateOperationService,
    private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      customReference: ['', Validators.required],
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
        name: this.entry.opAttachmentVersion.value.name,
        customReference: this.entry.opAttachmentVersion.customReference,
        filename: this.entry.opAttachmentVersion.value.file
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
    const name = this.registerForm.get('name').value;
    const customReference = this.registerForm.get('customReference').value;
    this.title = `Form ${customReference}. ${name}`;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  remove() {
    if(this.entry.id) {
      this.api.deleteOperationAttachment(this.entry.id).subscribe(response => {
        console.log(response);

        if (response.status === 'ok') {
          this.createOperationService.operation.opAttachments.splice(this.createOperationService.operation.opAttachments.indexOf(this.entry.id), 1);
          this.entry.hide = true;
          return this.toastr.success('Attachment removed.', 'Attachment removed');
        }
      });
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload) {
      this.registerForm.controls['filename'].setValue(this.fileToUpload.name);

      const formData = this.registerForm.value;
      const xentry = {
        id: `CF${formData.id}`,
        name: formData.id,
        file: this.fileToUpload
      };
      this.api.saveOperationAttachmentFile(xentry, this.operationId).subscribe(result=> {
        this.filePath = result.file;
      });
    }
  }

  save(){
    this.submitted = true;
    const formData = this.registerForm.value;
    if(this.registerForm.valid) {
      if(this.operationId) {
        const xentry = {
          id: this.entry.id,
          objectId: this.operationId,
          objectType:'operation',
          opAttachmentPrototypeId:1,
          type: 'form',
          opAttachmentVersion: {
            customReference: formData.id,
            value: {
              name: formData.name,
              file: this.filePath
            }
          }
        };
        this.api.saveOperationAttachment(xentry,this.operationId).subscribe(result => {
          console.log(result);
        });
        // TODO save and then what?
      } else if(this.gveId) {

        const xentry = {
          objectId: this.gveId,
          objectType:'gve',
          opAttachmentPrototypeId:1,
          type: 'form',
          opAttachmentVersion: {
            customReference: formData.id,
            value: {
              name: formData.name,
              file: this.filePath
            }
          }
        };
        this.api.saveOperationAttachment(xentry,this.operationId).subscribe(result => {
          console.log(result);
        });
      }
    }
  }
}
