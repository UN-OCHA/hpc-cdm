import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { AppState } from 'app/state/app.state';
import { GetOperationAttachments } from 'app/state/app.actions';

@Component({
  selector: 'operation-reports',
  templateUrl: './operation-reports.component.html',
  styleUrls: ['./operation-reports.component.scss']
})
export class OperationReportsComponent implements OnInit {
  @Select(AppState.operationAttachments) list$;

  constructor(
    private store: Store,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.store.dispatch(new GetOperationAttachments(params.id));
    });
  }
}
