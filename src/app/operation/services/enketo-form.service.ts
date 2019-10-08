import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { IEnketoFormService } from 'ng-enketo-form';
import { ApiService } from 'app/shared/services/api/api.service';
import { SubmissionsService } from 'app/shared/services/submissions.service';
import fileManager from 'enketo-core/src/js/file-manager';

@Injectable({providedIn: 'root'})
export class EnketoFormService implements IEnketoFormService {

  constructor(
    private api: ApiService,
    private submissions: SubmissionsService) {
    fileManager.getFileUrl = async (file) => {
      if(typeof file === 'string') {
        return await this.api.getFormFileUrl(file);
      } else if(file && file.name) {
        var timestamp = new Date().valueOf();
        // This is a temporary url to preview files
        const name = `${timestamp}${file.name}`;
        await this.api.saveFormFile(file, name);
        return await this.api.getFormFileUrl(name);
      }
    }
  }

  getForm(formUrl: any): Observable<any> {
    return this.api.getFile(formUrl);
  }

  getSubmission(formUrl: any, submissionId: any): Observable<any> {
    return from(new Promise(resolve => {
      // TODO document this.
      resolve({
        form: formUrl,
        content: JSON.stringify(this.submissions.tempSubmission || {})
      });
    }));
  }

  addSubmission(formUrl: any, submissionId: any, data: any): Observable<any> {
    this.submissions.tempSubmission = data;
    const files = fileManager.getCurrentFiles();
    files.map(blob => {
      this.api.saveFormFile(new File([blob], blob.name));
    });
    return null;
  }

  updateSubmission(formUrl: any, submissionId: any, data: any): Observable<any> {
    this.submissions.tempSubmission = data;
    const files = fileManager.getCurrentFiles();
    files.map(blob => {
      this.api.saveFormFile(new File([blob], blob.name));
    });
    return null;
  }
}
