import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listentityproto',
  templateUrl: './listEntityPrototype.component.html',
  styleUrls: [ './listEntityPrototype.component.scss' ]
})
export class ListEntityPrototypeComponent implements OnInit {
  public prototypes: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {

        let options = { scopes: 'entityPrototypeVersion'};
        this.apiService.getEntityPrototypes(params.id).subscribe(protos => {
          this.prototypes = protos;
        });
      }
    });
  }
}
