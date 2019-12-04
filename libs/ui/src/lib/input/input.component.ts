import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hpc-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() label;
  @Input() name;

  ngOnInit() {}
}

// (input)="clearErrors()"
// [ngClass]="ngClass"
