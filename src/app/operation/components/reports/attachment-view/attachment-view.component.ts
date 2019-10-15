import { Component, TemplateRef, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { SubmissionsService } from 'app/shared/services/operation/submissions.service';
import { ReportsService } from '../../../services/reports.service';

const STATUS_OPTIONS = ['NOT YET ENTERED', 'ENTERED', 'FINALISED'];

@Component({
  selector: 'attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit {
  @Input() entry: any;
  @Input() entryIdx: any;
  registerForm: FormGroup;
  title: String;
  status: String;
  modalRef: BsModalRef;
  expanded = false;
  formId = null;
  submissionId = null;
  editable = true;

  constructor(
    private fb: FormBuilder,
    private operation: OperationService,
    private reports: ReportsService,
    private submissions: SubmissionsService,
    private modalService: BsModalService,
    private router: Router) {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      filename: ['', Validators.required],
      reportFrom: [''],
      reportTo: [''],
      comments: ['']
    });
  }

  ngOnInit() {
    this.title= `Form ${this.entryIdx}. ${this.entry.formName}`
    this.status = STATUS_OPTIONS[this.entry.status];
    this.registerForm.reset({
      id: this.entry.formId,
      name: this.entry.formName,
      filename: this.entry.formFile.filepath,
      comments: this.entry.comments,
      reportFrom: this._date(this.operation.reportingWindow.startDate),
      reportTo: this._date(this.operation.reportingWindow.endDate)
    });
    this.operation.selectedAttachmentId$.subscribe(val => {
      this.expanded = val === this.entry.id;
    });
  }

  _date(value) {
    return new Date(value).toLocaleDateString();
  }

  toggleExpand() {
    if(!this.expanded) {
      this.operation.selectedAttachmentId = this.entry.id;
      this.expanded = true;
    } else {
      this.operation.selectedAttachmentId = null;
      this.expanded = false;
    }
  }

  formSubmitClick(event) {
    this.modalRef.hide();
  }

  formCloseClick(event) {
    event.stopPropagation();
    (<HTMLElement>document.body.querySelector('#submit-form')).click();
  }

  openForm(template: TemplateRef<any>) {
    this.submissions.formUrl = this.entry.formFile.filepath;
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    document.body.querySelector('#submit-form')
      .addEventListener('click', this.formSubmitClick.bind(this));
    document.body.querySelector('button.close')
      .addEventListener('click', this.formCloseClick.bind(this));
  }

  saveAndFinalize(finalize) {
    this.editable = false;
    const formData = this.registerForm.value;
    this.reports.saveReport(
      this.entry.id,
      this.submissions.tempSubmission,
      formData.comments, finalize)
    .subscribe(response => {
      this.operation.report = response;

      if(this.router.url.indexOf('entityreports') > 0) {
        this.operation.loadEntityAttachments(this.operation.selectedEntity.id);
      } else {
        this.operation.loadAttachments(this.operation.id);
      }
    });
  }

}
