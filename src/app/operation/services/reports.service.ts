import { Injectable } from '@angular/core';
// import {BehaviorSubject} from 'rxjs';
// import { ApiService } from 'app/shared/services/api/api.service';


@Injectable({providedIn: 'root'})
export class ReportsService {
  // api: ApiService;
  public operation: any;
  public stepIdx = 0;

  // private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  // readonly attachments$ = this._attachments.asObservable();

  constructor() {
    // this.api = api;
  }

  // get attachments(): Attachment[] {
  //   return this._attachments.getValue();
  // }
  //
  // set attachments(val: Attachment[]) {
  //   this._attachments.next(val);
  // }
}
