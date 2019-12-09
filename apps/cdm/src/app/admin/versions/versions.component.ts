import { Component, OnInit } from '@angular/core';

import { ModeService } from '@hpc/core';

const TITLES = {
}

@Component({
  selector: 'versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit {
  title: string;

  constructor(private modeService: ModeService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title =  'Publishing & Versions';//TITLES[mode];
    });
  }
}
