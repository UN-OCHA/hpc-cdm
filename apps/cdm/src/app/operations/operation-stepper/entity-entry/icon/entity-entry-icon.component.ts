import { Component, Inject, TemplateRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IconsModalComponent } from './icons-modal.component';

@Component({
  selector: 'entity-entry-icon',
  templateUrl: './entity-entry-icon.component.html',
  styleUrls: ['./entity-entry-icon.component.scss']
})
export class EntityEntryIconComponent implements OnInit {
  modalRef;
  @Input() icon: any;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
  }

  openModal(): void {
     this.modalRef = this.dialog.open(IconsModalComponent, {
       width: '90%',
       data: {icon: this.icon}
     });

     this.modalRef.afterClosed().subscribe(icon => {
       this.change.emit(icon);
     });
  }
}
