import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { IEnketoFormService } from 'ng-enketo-form';
import { ApiService } from 'app/shared/services/api/api.service';
import { SubmissionsService } from 'app/operation/services/submissions.service';

@Injectable({providedIn: 'root'})
export class EnketoFormService implements IEnketoFormService {

  constructor(
    private api: ApiService,
    private submissions: SubmissionsService) {}

  getForm(formUrl: string): Observable<any> {
    return this.api.getFile(formUrl);
  }

  getSubmission(id: string): Observable<any> {
    return from(new Promise(resolve => {
      // TODO document this.
      resolve({
        form: this.submissions.formUrl,
        content: JSON.stringify(this.submissions.tempSubmission || {})
      });
    }));
  }

  addSubmission(data: any): Observable<any> {
    this.submissions.tempSubmission = data;
    return null;
  }

  updateSubmission(submissionId: string, data: any): Observable<any> {
    this.submissions.tempSubmission = data;
    return null;
  }
}
