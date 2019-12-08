import { Component, OnInit } from '@angular/core';

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
  title: string;

  constructor(){}

  ngOnInit() {
  }
}
