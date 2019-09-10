import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-listblueprint',
  templateUrl: './listblueprint.component.html',
  styleUrls: ['./listblueprint.component.scss']
})
export class ListblueprintComponent implements OnInit {
  public blueprints: any[];
  constructor(public apiService: ApiService, private toastr: ToastrService) {
  }
  ngOnInit() {
    this.apiService.getBlueprints().subscribe(blueprints => {
      this.blueprints = blueprints;
    });
  }

  deleteBlueprint(blueprint: any) {
    return this.apiService.deleteBlueprint(blueprint.id)
      .subscribe(response => {
        console.log(response);
        if (response.status === 'ok') {
          this.blueprints.splice(this.blueprints.indexOf(blueprint), 1);
          return this.toastr.success('Blueprint removed.', 'Blueprint removed');
        }
      });

  }
}
