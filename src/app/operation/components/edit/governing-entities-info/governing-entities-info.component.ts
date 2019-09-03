
import { Component, OnInit, AfterViewInit } from '@angular/core';

import { CreateOperationChildComponent } from '../create-operation-child/create-operation-child.component';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';

@Component({
  selector: 'app-governing-entities-info',
  templateUrl: './governing-entities-info.component.html',
  styleUrls: ['./governing-entities-info.component.scss']
})
export class GoverningEntitiesInfoComponent extends CreateOperationChildComponent implements OnInit, AfterViewInit {
  objectKeys = Object.keys;
  openById = {};

  public governingEntityBeingViewed = 0;
  public status = false;

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService
  ) {
    super(createOperationService, apiService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.isValid = true;
    this.createOperationService.operationHasLoaded$
      .subscribe(() => {
      });
  }
  ngAfterViewInit() {
    this.status = true;
  }

}
