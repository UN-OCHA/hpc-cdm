import { Injectable } from '@angular/core';
// import { Observable, from } from 'rxjs';
import { Observable } from 'rxjs';
import { IEnketoFormService } from 'ng-enketo-form';
import { ApiService } from 'app/shared/services/api/api.service';


@Injectable()
export class EnketoFormService implements IEnketoFormService {

  submission: any;
  submissions = {};

  constructor(private api: ApiService) {}

  getForm(fileUrl: string): Observable<any> {
    return this.api.getFile(fileUrl);
  }

  getSubmission(id: string): Observable<any> {
    //
    return null;
  }

  addSubmission(data: any): Observable<any> {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
    console.log(data);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
    this.submissions = data;
    return null;
  }

  updateSubmission(submissionId: string, data: any): Observable<any> {
    this.submissions[submissionId] = data;
    return null;
  }
}
