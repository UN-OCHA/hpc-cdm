import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'app-listblueprint',
  templateUrl: './listblueprint.component.html',
  styleUrls: ['./listblueprint.component.scss']
})
export class ListblueprintComponent implements OnInit {
  public blueprints: any[];
  constructor(public apiService: ApiService) {
  }
  ngOnInit() {
    this.apiService.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints;
    });
  }
}
