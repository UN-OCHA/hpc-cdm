import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-filter-options-modal',
  templateUrl: './filter-options-modal.component.html'
})
export class FilterOptionsModalComponent {
  public modalRef: BsModalRef;

  @Input() filtersByField;
  @Input() filterByStatus;
  @Output() onStatusesUpdate = new EventEmitter();
  @Input() dataUpdatedObservable$;
  @Input() filterOnFields;

  constructor(
    private modalService: BsModalService
  ) { }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public removeFieldFromSelectedFields (field) {
    field.selected = false;
    this.filterOnFields(this.filtersByField);
  }
}
