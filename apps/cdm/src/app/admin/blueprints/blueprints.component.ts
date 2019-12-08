import { Component, OnInit } from '@angular/core';

import { ModeService } from '@hpc/core';

const TITLES = {
  'add': 'New Blueprint',
  'edit': 'Edit Blueprint',
  'list': 'Blueprints'
}

@Component({
  selector: 'blueprints',
  templateUrl: './blueprints.component.html',
  styleUrls: ['./blueprints.component.scss']
})
export class BlueprintsComponent implements OnInit {
  title: string;

  constructor(private service: ModeService){}

  ngOnInit() {
    this.service.mode$.subscribe(mode => {
      this.title =  TITLES[mode];
    });
  }
}
