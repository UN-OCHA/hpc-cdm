import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'operation-publish',
  templateUrl: './operation-publish.component.html',
  styleUrls: [ './operation-publish.component.scss' ]
})
export class OperationPublishComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private operation: OperationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      // TODO load whatever is needed
      this.operation.loadEntityPrototypes(params.id);
    });
  }
}
