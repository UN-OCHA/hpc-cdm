import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hpc-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() id: string;
  @Input() label: string;
  @Input() name?: string;
  @Input() required?: boolean;
  @Input() disabled?: boolean;
  @Input() formControlName: string;


  ngOnInit() {}
}

// (input)="clearErrors()"
// [ngClass]="ngClass"
