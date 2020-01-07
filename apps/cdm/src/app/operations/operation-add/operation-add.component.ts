import { Component, OnInit } from '@angular/core';
import { ModeService } from '@hpc/core';

@Component({
  selector: 'operation-add',
  templateUrl: './operation-add.component.html',
  styleUrls: ['./operation-add.component.scss'],
})
export class OperationAddComponent implements OnInit {

  constructor(private modeService: ModeService) {}

  ngOnInit() {
    this.modeService.mode = 'add';
  }
}
