import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '@hpc/core';

@Injectable({providedIn: 'root'})
export class ReportingWindowsService {
  constructor(private api: ApiService) { }

  private readonly _mode = new BehaviorSubject<string>('');
  readonly mode$ = this._mode.asObservable();

  get mode(): string { return this._mode.getValue(); }
  set mode(val: string) { this._mode.next(val); }
}
