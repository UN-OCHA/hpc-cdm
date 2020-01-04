import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, ModeService } from '@hpc/core';

const TITLES = {
  'add': 'New Operation',
  'edit': 'Edit Operation',
  'list': 'Operations'
}

@Component({
  selector: 'operations',
  templateUrl: './operations.component.html',
  styleUrls: [ './operations.component.scss' ],
})
export class OperationsComponent implements OnInit, OnDestroy {
  title: string;
  mode: string;
  readonly user$ = this.authService.user$;

  constructor(
    private authService: AuthService,
    private modeService: ModeService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      this.title =  TITLES[mode];
    });
  }

  ngOnDestroy() {
    // this.modeService.mode$.unsubscribe();
  }
}
