import { Component, OnInit } from '@angular/core';
import { AuthService, ModeService } from '@hpc/core';


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
  title: string;

  constructor(
    private modeService: ModeService){}

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.title =  TITLES[mode];
    });
  }
}
