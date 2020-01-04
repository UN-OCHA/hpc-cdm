import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '@hpc/core';

@Component({
  selector: 'reporting-window-menu',
  templateUrl: './reporting-window-menu.component.html',
  styleUrls: ['./reporting-window-menu.component.scss']
})
export class ReportingWindowMenuComponent implements OnInit {
  @Input() reportingWindow;

  constructor(
    activatedRoute: ActivatedRoute,
    appService: AppService) {
  }

  ngOnInit() {
  }
}
