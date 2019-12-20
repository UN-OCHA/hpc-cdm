import { Component, Input, OnInit, ContentChild, ElementRef } from '@angular/core';
import { environment, AuthService } from '@hpc/core';

@Component({
  selector: 'hpc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @Input() name: string;
  @Input() version: string;

  constructor (private auth: AuthService) {}

  ngOnInit() {}
}
