import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  templateUrl: './adminPage.component.html'
})
export class AdminPageComponent {

  public adminForObjects = [
    'planProcedure'
  ];

  constructor() {}
}
