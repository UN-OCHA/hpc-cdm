import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/shared/services/api/api.service';
import { OperationService } from 'app/shared/services/operation/operation.service';
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
    private operation: OperationService,
    private apiService: ApiService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operationId = params.id
      this.apiService.getAttachmentPrototypes(this.operationId).subscribe(protos => {
        this.prototypes = protos;
      });
      //TODO remove api and use operation to drive the table.
      this.operation.loadEntityPrototypes(params.id);
    });
  }
}
