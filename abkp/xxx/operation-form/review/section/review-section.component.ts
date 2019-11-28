import { Injectable, OnInit, Input } from '@angular/core';

import { CreateOperationService } from 'app/operation/services/create-operation.service';

@Injectable()
export abstract class ReviewSectionComponent implements OnInit {

  @Input() loadedComplete;
  @Input() operation;

  constructor(
    public cPS: CreateOperationService,
  ) { }

  ngOnInit() {
    if (this.operation) {
      this.buildView();
    }
    if (this.loadedComplete) {
      this.loadedComplete
        .subscribe(() => {
          this.buildView();
        });
    }
  }

  public buildView () {}
}
