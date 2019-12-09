import { Component, Inject, TemplateRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import entityIcons from './entity.icons';

export interface DialogData {
  icon: string;
}

@Component({
  selector: 'icons-modal',
  templateUrl: './icons-modal.component.html',
  styleUrls: ['./icons-modal.component.scss']
})
export class IconsModalComponent implements OnInit {
  icon;
  icons = [];

  constructor(
    public dialogRef: MatDialogRef<IconsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.icon = data.icon;
    console.log(this.icon);
  }

  ngOnInit() {
    this.icons = entityIcons.icons;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectIcon(icon) {
    this.dialogRef.close(icon);
  }
}
