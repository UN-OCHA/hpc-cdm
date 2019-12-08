import { Component, OnInit } from '@angular/core';
import { AuthService } from '@hpc/core';
import { OperationService } from '@cdm/core';


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
export class OperationsComponent implements OnInit {
  title: string;

  constructor(
    private authService: AuthService,
    private operationService: OperationService){}

  ngOnInit() {
    this.operationService.mode$.subscribe(mode => {
      console.log(mode)
      this.title =  TITLES[mode];
    });
  }
}
