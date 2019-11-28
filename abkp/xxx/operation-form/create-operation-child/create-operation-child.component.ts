import { OnInit, Injectable, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

// import { CreateOperationService } from 'app/operation/services/create-operation.service';
// import { ComponentCanDeactivate } from 'app/shared/services/auth/pendingChanges.guard.service';

@Injectable()
export abstract class CreateOperationChildComponent implements OnInit, ComponentCanDeactivate {

  public isValid = false;
  public editable = false;


  @ViewChild('childForm') public childForm: NgForm;

  constructor(
    // public createOperationService: CreateOperationService,
    // public apiService: ApiService,
  ) { }

  ngOnInit() {}

  public setEditable () {
    // if (this.createOperationService.operation) {
    //   this.editable = true;//this.createOperationService.operation.editableByUser;
    // }
  }

  public canDeactivate(): Observable<boolean> | boolean {
    return this.childForm.pristine;
  }

}
