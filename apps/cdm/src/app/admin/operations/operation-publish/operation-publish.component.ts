import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@cdm/core';

@Component({
  selector: 'operation-publish',
  templateUrl: './operation-publish.component.html',
  styleUrls: [ './operation-publish.component.scss' ]
})
export class OperationPublishComponent implements OnInit {
  tableColumns = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private operationService: OperationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      // TODO load whatever is needed
      this.operationService.loadEntityPrototypes(params.operationId);
    });
  }
}
