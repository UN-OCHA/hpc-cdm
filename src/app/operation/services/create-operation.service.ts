import { Subject } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { Operation } from '../models/view.operation.model';

import { ApiService } from 'app/shared/services/api/api.service';

import * as _ from 'lodash';

@Injectable()
export class CreateOperationService {
  public operation: Operation;
  public isNewOperation = true;
  public editable = false;
  public processing = 0;
  public editMode = true;

  private operationLoadedSource = new Subject<boolean>();
  public operationHasLoaded$ = this.operationLoadedSource.asObservable();

  constructor(
    private apiService: ApiService,
  ) {}

  public fetchOperation(id: number, version = 'latest', isPublic?) {
    let subscription = this.apiService.getOperation(id, version);
    return subscription.pipe(
      map(operation => {
        this.isNewOperation = false;
        operation.exists = true;
        this.operationDoneLoading(operation);
      }));
  }

  public operationDoneLoading(operation: Operation) {
    this.operation = new Operation(operation);
    this.operationLoadedSource.next(true);
  }

  public unmask(num: any): number {
    if (num) {
      const newNumber = (num.toString().replace(/,/gi, ''));
      return +newNumber;
    } else {
      return num;
    }
  }
}
