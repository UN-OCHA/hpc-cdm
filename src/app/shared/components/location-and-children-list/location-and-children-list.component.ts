import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-location-and-children-list',
  templateUrl: './location-and-children-list.component.html',
  styleUrls: ['./location-and-children-list.component.scss']
})
export class LocationAndChildrenListComponent implements OnInit {

  @Input() location;

  constructor() { }

  ngOnInit() {
  }

}
