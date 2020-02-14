import { Component, OnInit } from '@angular/core';
import { AppService, ModeService } from '@hpc/core';

const TITLES = {
  'add': 'New Reporting Window',
  'edit': 'Edit Reporting Window',
  'list': 'Reporting Windows'
}
@Component({
  selector: 'reporting-windows',
  templateUrl: './reporting-windows.component.html'
})
export class ReportingWindowsComponent implements OnInit {
<<<<<<< HEAD
  titles;
  mode;
=======
  title: string;  
>>>>>>> cdm-dev

  constructor(
    private appService: AppService,
    private modeService: ModeService){
    this.titles = TITLES;
  }

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }
}
