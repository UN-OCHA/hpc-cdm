import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit {
  registerForm: FormGroup;

  list = [];
  @Input() operationId;
  @Input() gveId;
  @Input() entry: any;
  @Input() entryIdx: any;
  expanded = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      filename: ['', Validators.required],
      comments: ['']
    });
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

}
