import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataEntry } from './data-queue.service';
import { ApiService } from '@hpc/core';

export interface DataVersion {
  version: any;
  name: any;
  lastEdit: any;
  status: any;
  period: any;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class QueueEntryService {
  public entry: DataEntry;
  private readonly _versions = new BehaviorSubject<DataVersion[]>([]);
  readonly versions$ = this._versions.asObservable();

  constructor(private api: ApiService) {}

  get versions(): DataVersion[] { return this._versions.getValue(); }
  set versions(val: DataVersion[]) { this._versions.next(val); }

  loadDataVersions() {
    this.api.getDataVersions(this.entry).subscribe(response => {
      // TODO use actual end point data.
      this.versions = response.map(re => {
        return this.buildVersion(re);
      });
    });
  }

  dummy(){}

  private buildVersion(re) {
    return {
      version: 'v1',
      name: 'Raw',
      lastEdit: 'Janet Puhalovic',
      status: 'Finalised',
      period: '1 Jan 2019 - 31 Dec 2019',
      data: '[Data in Form]'
    }
  }
}
