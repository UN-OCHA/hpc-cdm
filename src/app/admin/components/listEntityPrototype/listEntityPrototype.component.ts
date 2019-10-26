import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { EntityPrototype } from 'app/shared/services/operation/operation.models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listentityproto',
  templateUrl: './listEntityPrototype.component.html',
  styleUrls: [ './listEntityPrototype.component.scss' ]
})
export class ListEntityPrototypeComponent implements OnInit {
  prototypes: EntityPrototype[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private operation: OperationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.loadEntityPrototypes(params.id);
    });

    this.operation.entityPrototypes$.subscribe(protos => {
      this.prototypes = protos;
    });
  }
}
