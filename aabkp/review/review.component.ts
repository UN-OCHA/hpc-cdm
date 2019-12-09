import { Component, OnInit } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import {map} from 'rxjs/operators';
import { ApiService } from '@hpc/core';
import { OperationService } from '@cdm/core';
// import { CreateOperationService } from 'app/operation/services/create-operation.service';
// import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';


@Component({
  selector: 'operation-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public title: string;
  public closeBtnName: string;

  public errors = [];

  public loadedSubject = new Subject<any>();
  public loadedComplete = this.loadedSubject.asObservable();
  public finishedLoading = false;
  isValid: boolean;

  constructor(
    private operationService: OperationService,
    private apiService: ApiService) {}

  ngOnInit() {
    // this.loadedComplete
    //   .subscribe(() => {
    //     this.finishedLoading = true;
    //   });

    this.setOperationForReview();
    // this.createOperationService.operationHasLoaded$
    //   .subscribe(() => {
    //     this.setOperationForReview();
    //   });
  }

  save(): Observable<any> {
    this.validation();
    return this.postReviewing();
  }

  validation (): boolean {
    this.errors = [];
    this.isValid = true;
    return this.isValid;
  }

  setOperationForReview () {
  }

  private postReviewing (): Observable<any> {
    return null;
    // return this.createOperationService.fetchOperation(this.createOperationService.operation.id).pipe(
    //   map(() => {
    //     return {
    //       stopSave: true,
    //       submitted: true
    //     };
    //   }));
  }
}
