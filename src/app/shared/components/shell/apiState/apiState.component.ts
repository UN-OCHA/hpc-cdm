import { Component } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'app-api-state',
  templateUrl: './apiState.component.html'
})
export class APIStateComponent {
  constructor(
    public apiService: ApiService
  ) {}
}
