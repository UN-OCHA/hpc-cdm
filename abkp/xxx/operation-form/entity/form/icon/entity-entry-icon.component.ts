import { Component, TemplateRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import entityIcons from './entity.icons';

@Component({
  selector: 'entity-entry-icon',
  templateUrl: './entity-entry-icon.component.html',
  styleUrls: ['./entity-entry-icon.component.scss']
})
export class EntityEntryIconComponent implements OnInit {
  icons = [];
  modalRef: BsModalRef;
  @Input() icon: any;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: BsModalService) {}

  ngOnInit() {
    this.icons = entityIcons.icons;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }

  selectIcon(icon) {
    this.change.emit(icon);
    this.modalRef.hide();
  }
}
