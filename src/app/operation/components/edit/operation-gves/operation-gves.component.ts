import { Component, OnInit } from '@angular/core';

const EMPTY_GVE = {abbreviation: '', name: '', comments: '', date:'', terms:''};

@Component({
  selector: 'operation-gves',
  templateUrl: './operation-gves.component.html',
  styleUrls: ['./operation-gves.component.scss']
})
export class OperationGvesComponent implements OnInit {
  public list = [];

  constructor() {}

  ngOnInit() {
    this.list.push(EMPTY_GVE);
  }

  addGve() {
    this.list.push(EMPTY_GVE)
  }

  isLastEntryNew() {
    return this.list[this.list.length - 1].id === null;
  }
}
