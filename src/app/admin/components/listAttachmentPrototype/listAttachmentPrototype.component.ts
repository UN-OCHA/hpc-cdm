import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listattachmentproto',
  templateUrl: './listAttachmentPrototype.component.html',
  styleUrls: [ './listAttachmentPrototype.component.scss' ]
})
export class ListAttachmentPrototypeComponent implements OnInit {
  public prototypes: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.apiService.getAttachmentPrototypes(params.id).subscribe(protos => {
          this.prototypes = protos;
        });
      }
    });
  }
}
