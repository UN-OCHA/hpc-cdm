import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SubmissionsService {
  public formUrl: string;
  public tempSubmission: any;
  public submissions = {};

  constructor() {}
}
