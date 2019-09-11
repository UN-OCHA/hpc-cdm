
import { Observable,zip as observableZip } from 'rxjs';
import {map} from 'rxjs/operators';

import { Component, OnInit, AfterViewInit } from '@angular/core';

import { CreateOperationChildComponent } from '../create-operation-child/create-operation-child.component';
import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { GoverningEntity } from 'app/operation/models/view.operation.model';

@Component({
  selector: 'app-governing-entities-info',
  templateUrl: './governing-entities-info.component.html',
  styleUrls: ['./governing-entities-info.component.scss']
})
export class GoverningEntitiesInfoComponent extends CreateOperationChildComponent implements OnInit, AfterViewInit {
  objectKeys = Object.keys;
  openById = {};

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

  public save (): Observable<any> {
    const postSaveObservables = [];
    this.createOperationService.operation.opGoverningEntities.forEach(governingEntity => {
      postSaveObservables.push(
        this.apiService.saveGoverningEntity(governingEntity));
    });

    return observableZip(
      ...postSaveObservables
    ).pipe(map(results => {
      console.log(results);
        return {
          stopSave: true
        };
      }));
  }
  public addNewGoverningEntity() {
    this.createOperationService.operation.opGoverningEntities.push(new GoverningEntity({
      entityPrototypeId:8,
      operationId: this.createOperationService.operation.id,
      opGoverningEntityVersion:{
        value:{}
      }
    }));
  }

}
