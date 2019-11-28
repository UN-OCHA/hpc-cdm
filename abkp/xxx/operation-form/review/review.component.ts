
import { Observable ,  Subject } from 'rxjs';

import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '@hpc/core';
// import { CreateOperationService } from 'app/operation/services/create-operation.service';
// import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';


@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
// export class ReviewComponent extends CreateOperationChildComponent implements OnInit {
export class ReviewComponent implements OnInit {


  public title: string;
  public closeBtnName: string;

  public errors = [];

  public loadedSubject = new Subject<any>();
  public loadedComplete = this.loadedSubject.asObservable();
  public finishedLoading = false;

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService,
  ) {
    super(createOperationService, apiService);
  }

  ngOnInit() {
    this.loadedComplete
      .subscribe(() => {
        this.finishedLoading = true;
      });

    this.setOperationForReview();
    this.createOperationService.operationHasLoaded$
      .subscribe(() => {
        this.setOperationForReview();
      });
  }

  public save(): Observable<any> {

    this.validation();

    return this.postReviewing();
  }

  public validation (): boolean {
    this.errors = [];
    this.isValid = true;

    return this.isValid;
  }

  private setOperationForReview () {
    if (this.createOperationService.operation) {
    }
  }

  private postReviewing (): Observable<any> {
    return this.createOperationService.fetchOperation(this.createOperationService.operation.id).pipe(
      map(() => {
        return {
          stopSave: true,
          submitted: true
        };
      }));
  }

}
