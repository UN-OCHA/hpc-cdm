import { Injectable, OnInit, Input } from '@angular/core';

@Injectable()
export abstract class ReviewSectionComponent implements OnInit {

  @Input() loadedComplete;
  @Input() operation;

  constructor(
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
