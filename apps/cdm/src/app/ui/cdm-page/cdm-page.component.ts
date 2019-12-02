import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'cdm-page',
  templateUrl: './cdm-page.component.html',
  styleUrls: ['./cdm-page.component.scss']
})
export class CdmPageComponent implements OnInit {
  @Input() title: string;

  @ContentChild('cdmPageBodyTemplate', {static: false})
  pageBodyTemplateRef: TemplateRef<any>;

  @ContentChild('cdmPageTitleActionsTemplate', {static: false})
  pageTitleTemplateRef: TemplateRef<any>;

  constructor() {}

  ngOnInit() {}
}
