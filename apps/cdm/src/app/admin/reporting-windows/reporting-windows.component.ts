import { Component, OnInit } from '@angular/core';
import { AuthService } from '@hpc/core';
import { ReportingWindowsService } from './reporting-windows.service';


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
    private service: ReportingWindowsService){}

  ngOnInit() {
    this.service.mode$.subscribe(mode => {
      this.title =  TITLES[mode];
    });
  }
}
