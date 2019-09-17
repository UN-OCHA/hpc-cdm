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
  public operationId = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationId = params.id
        this.apiService.getAttachmentPrototypes(this.operationId).subscribe(protos => {
          this.prototypes = protos;
        });
      }
    });
  }
}
