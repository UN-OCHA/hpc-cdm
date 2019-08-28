import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {

  @Input() object;
  @Input() label;

  @Output() onSelect = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public selectObject (object) {
    object.selected = !object.selected;
    this.onSelect.emit(object);
  }
}
