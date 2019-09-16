import { Component, TemplateRef, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';


@Component({
  selector: 'attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit {
  registerForm: FormGroup;
  title: String;
  modalRef: BsModalRef;
  @Input() entry: any;
  @Input() entryIdx: any;
  expanded = false;

  constructor(
    private fb: FormBuilder,
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
    console.log(this.entry)
    this.title= `Form ${this.entryIdx}. ${this.entry.formName}`
    this.registerForm.reset({
      id: this.entry.formId,
      name: this.entry.formName,
      filename: this.entry.formFileName,
      comments: this.entry.comment
    });
    console.log(this.entry)
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  openForm(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }

}
