import { Component, TemplateRef, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SubmissionsService } from '../../../services/submissions.service';
// import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit {
  registerForm: FormGroup;
  title: String;
  status: String;
  modalRef: BsModalRef;
  @Input() entry: any;
  @Input() entryIdx: any;
  expanded = false;
  formId = null;
  submissionId = null;
  editable = true;

  constructor(
    private fb: FormBuilder,
    private submissions: SubmissionsService,
    private modalService: BsModalService) {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      filename: ['', Validators.required],
      reportFrom: ['', Validators.required],
      reportTo: ['', Validators.required],
      comments: ['']
    });
  }

  ngOnInit() {
    this.title= `Form ${this.entryIdx}. ${this.entry.formName}`
    this.status = 'NOT YET ENTERED';
    this.registerForm.reset({
      id: this.entry.formId,
      name: this.entry.formName,
      filename: this.entry.formFilePath,
      comments: this.entry.comment
    });
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  openForm(template: TemplateRef<any>) {
    this.submissions.formUrl = this.entry.formFilePath;
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }

  save() {
    const formData = this.registerForm.value;
    console.log(formData);
    console.log(this.submissions.tempSubmission);
  }

  saveAndFinalise() {
    this.editable=false;
  }

}
