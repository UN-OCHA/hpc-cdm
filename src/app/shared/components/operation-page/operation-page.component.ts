import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'operation-page',
  templateUrl: './operation-page.component.html',
  styleUrls: ['./operation-page.component.scss']
})
export class OperationPageComponent implements OnInit {
  @Input() description?: string;
  @Input() route?: string;
  showMenu = false;

  constructor() {}

  ngOnInit() {}

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}


// <div class="loaderMainPanel" *ngIf="apiService.inProgress">
//   <div class="project-page-loader">
//     <i class="fa fa-circle-o-notch fa-spin"></i>
//   </div>
// </div>
