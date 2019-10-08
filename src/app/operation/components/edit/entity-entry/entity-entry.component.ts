import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationService } from 'app/shared/services/operation.service';

@Component({
  selector: 'entity-entry',
  templateUrl: './entity-entry.component.html',
  styleUrls: ['./entity-entry.component.scss']
})
export class EntityEntryComponent implements OnInit {
  form: FormGroup;
  entity: any;
  @Input() readOnly?: boolean;

  constructor(
    private operation: OperationService,
    private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [''],
      technicalArea: ['', Validators.required],
      activationDate: ['', Validators.required],
      deactivationDate: [''],
      activationLetter: [''],
      deactivationLetter: [''],
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

  isRemovable() {
    return this.entity && this.entity.id &&
      this.operation.route !== 'EDIT_ENTITY_ATTACHMENTS';
  }

  isDisabledField(field) {
    return this.operation.route === 'EDIT_ENTITY_ATTACHMENTS';
  }
}
