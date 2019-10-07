import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationService } from 'app/operation/services/operation.service';

@Component({
  selector: 'gve-entry',
  templateUrl: './gve-entry.component.html',
  styleUrls: ['./gve-entry.component.scss']
})
export class GveEntryComponent implements OnInit {
  form: FormGroup;
  entity: any;
  // submitted = false;
  @Input() readOnly?: boolean;

  constructor(
    private operation: OperationService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [''],
      technicalArea: ['', Validators.required],
      activationDate: ['', Validators.required],
      deactivationDate: ['', Validators.required],
      activationLetter: ['', Validators.required],
      deactivationLetter: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.operation.selectedEntity$.subscribe(selectedEntity => {
      if(selectedEntity) {
        this.entity = selectedEntity;
        this.form.reset(selectedEntity);
      }
    });
  }

  get f() { return this.form.controls; }
  // clearErrors = () => { this.submitted = false; }

  save() {
    // this.submitted = true;
    this.operation.addEntity(this.form.value, this.entity);
  }

  remove() {
    this.operation.removeEntity(this.entity.id);
  }
}
