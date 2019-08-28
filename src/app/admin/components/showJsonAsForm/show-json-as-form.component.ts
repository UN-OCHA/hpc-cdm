import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-json-as-form',
  templateUrl: './show-json-as-form.component.html'
})
export class ShowJsonAsFormComponent implements OnInit {
  @Input() value: any;
  constructor() {
  }

  ngOnInit() {
    if (this.value) {
      // TODO: Implement this.
      // console.log('this.value', JSON.parse(this.value));
    }
  }
}
