import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class BlueprintsComponent implements OnInit, OnDestroy {
  title: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modeService: ModeService){}

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      console.log(data)
    });
    this.modeService.mode$.subscribe(mode => {
      this.title = TITLES[mode];
    });
  }

  ngOnDestroy() {
    // this.modeService.mode$.unsubscribe();
  }
}
