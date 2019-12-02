import { Component, OnInit } from '@angular/core';
import { AppService, OperationService } from '@cdm/core';
import { Operation } from '@hpc/data';
import { AuthService } from '@hpc/core';

@Component({
  selector: 'reporting-window-menu',
  templateUrl: './reporting-window-menu.component.html',
  styleUrls: ['./reporting-window-menu.component.scss']
})
export class ReportingWindowMenuComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }
}
