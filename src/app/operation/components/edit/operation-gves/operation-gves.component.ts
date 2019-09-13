import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable,zip as observableZip } from 'rxjs';
import {map} from 'rxjs/operators';

import { ApiService } from 'app/shared/services/api/api.service';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';

@Component({
  selector: 'operation-gves',
  templateUrl: './operation-gves.component.html',
  styleUrls: ['./operation-gves.component.scss']
})
export class OperationGvesComponent extends CreateOperationChildComponent implements OnInit {
  public list = [];
  public entityPrototypeId = null;

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    super(createOperationService, apiService);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params.entityPrototypeId) {
        this.entityPrototypeId = this.entityPrototypeId;
        this.list = this.createOperationService.operation.opGoverningEntities.filter(gve => gve.entityPrototypeId === params.entityPrototypeId);
      }
    });
  }

  addGve() {
    const EMPTY_GVE = {
      entityPrototypeId:this.entityPrototypeId,
      operationId: this.createOperationService.operation.id,
      opGoverningEntityVersion:{
        abbreviation: '', name: '', comments: '', date:'', terms:''
      }
    };
    this.list.push(EMPTY_GVE)
  }

  isLastEntryNew() {
    return this.list[this.list.length - 1].id === null;
  }

  public save (): Observable<any> {
    console.log(this.list);
    const postSaveObservables = [];
    this.list.forEach(governingEntity => {
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
}
