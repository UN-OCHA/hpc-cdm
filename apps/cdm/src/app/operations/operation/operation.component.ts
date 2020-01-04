import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, AuthService } from '@hpc/core';
import { Operation } from '@hpc/data';

const TITLES = {
  'add': 'New Operation',
  'edit': 'Edit Operation',
  'list': 'Operations'
}

@Component({
  selector: 'operation',
  templateUrl: './operation.component.html',
  styleUrls: [ './operation.component.scss' ],
})
export class OperationComponent implements OnInit {
  operation$ = this.appService.operation$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService){
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
      this.appService.loadOperation(params.id);
    });
  }
}
