import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ReportingWindow } from '@hpc/data';
// import { ReportingWindowService } from '@cdm/core';


@Component({
  selector: 'window-page',
  templateUrl: './window-page.component.html',
  styleUrls: ['./window-page.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('titleExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class WindowPageComponent implements OnInit {
  @Input() title?;
  @Input() reportingWindow?: ReportingWindow;
  titleExpanded = false;

  @ContentChild('windowPageTitleActionsTemplate', {static: false})
  pageTitleTemplateRef: TemplateRef<any>;

  @ContentChild('windowPageBodyTemplate', {static: false})
  pageBodyTemplateRef: TemplateRef<any>;


  constructor() {}

  ngOnInit() {
  }

  toggleTitle() {
    this.titleExpanded = !this.titleExpanded;
  }
}
