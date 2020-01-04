import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
// import { ApiService } from '@hpc/core';

export interface DataEntry {
  context: any;
  entities: any;
  name: any;
  type: any;
  dataStatus: any;
  cleanStatus: any;
}

@Injectable({ providedIn: 'root' })
export class DataQueueService {

  private readonly _selectionState = new Subject<string>();
  readonly selectionState$ = this._selectionState.asObservable();

  private readonly _entries = new BehaviorSubject<DataEntry[]>([]);
  readonly entries$ = this._entries.asObservable();

  constructor(
    // private api: ApiService
  ) {}

  get entries(): DataEntry[] { return this._entries.getValue(); }
  set entries(val: DataEntry[]) { this._entries.next(val); }

  set selectionState(val: string) { this._selectionState.next(val); }

  loadDataEntries(windowId) {
    // TODO vimago what service?
    // this.api.getDataEntries(windowId).subscribe(response => {
    //   // TODO use actual end point data.
    //   this.entries = response.map(re => {
    //     return this.buildEntry(re);
    //   });
    // });
  }

  private buildEntry(re) {
    return {
      context: 'PLHNGA19',
      name: 'Percentage of children receiving malnutrition assistance',
      entities: 'CLNUT | CA2',
      type: 'Indicator',
      dataStatus: 'Raw: Finalised',
      cleanStatus: 'Waiting for field response'
    }
  }
}
