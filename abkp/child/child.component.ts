import { OnInit, Injectable, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

// import { CreateReportingWindowService } from 'app/reporting-window/services/create-reporting-window.service';
import { ApiService } from '@hpc/core';

// import { ComponentCanDeactivate } from 'app/shared/services/auth/pendingChanges.guard.service';

@Injectable()
export abstract class ReportingWindowChildFormComponent implements OnInit{//}, ComponentCanDeactivate {

  public isValid = false;
  public editable = false;


  @ViewChild('childForm') public childForm: NgForm;

  constructor(
    // public createReportingWindowService: CreateReportingWindowService,
    public apiService: ApiService,
  ) { }

  ngOnInit() {}

  public setEditable () {
    // if (this.createReportingWindowService.reportingWindow) {
    //   this.editable = true;//this.createReportingWindowService.reportingWindow.editableByUser;
    // }
  }

  public canDeactivate(): Observable<boolean> | boolean {
    return this.childForm.pristine;
  }

}
