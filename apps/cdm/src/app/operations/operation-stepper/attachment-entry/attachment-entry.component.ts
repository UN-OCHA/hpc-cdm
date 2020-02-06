import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationService } from '@cdm/core';
import { Attachment } from '@hpc/data';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'attachment-entry',
  templateUrl: './attachment-entry.component.html',
  styleUrls: ['./attachment-entry.component.scss']
})
export class AttachmentEntryComponent implements OnInit {
  form: FormGroup;
  @Input() entry: Attachment;

  title: string;
  hide: boolean;
  expanded = false;
  submitted = false;

  constructor(
    private operation: OperationService,
    private fb: FormBuilder,
    private toastr: ToastrService
    ) {
    this.form = this.fb.group({
      id: [''],
      formId: ['', Validators.required],
      formName: ['', Validators.required],
      formFile: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.form.reset(this.entry);
    this.operation.selectedAttachment$.subscribe(selected => {
      this.expanded = selected ? (selected.id == this.entry.id) : false;
    });
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    this.operation.selectedAttachment = this.expanded ? this.entry : null;
  }

  remove() {
    this.operation.removeAttachment(this.entry.id);
  }

  save() {

     this.operation.saveAttachment(this.form.value, this.entry).then(res =>{
      if (this.form.value.id) {
        this.toastr.success('Operation attachment updated');
      } else {
        this.toastr.success('Operation attachment created');
      }
     }).catch(err =>{
       this.toastr.error("Error Occured.")
     });

  }
}
