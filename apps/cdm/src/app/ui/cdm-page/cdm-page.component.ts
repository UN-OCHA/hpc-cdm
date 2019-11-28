import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cdm-page',
  templateUrl: './cdm-page.component.html',
  styleUrls: ['./cdm-page.component.scss']
})
export class CdmPageComponent implements OnInit {
  @Input() title: string;

  constructor() {}

  ngOnInit() {}
}
