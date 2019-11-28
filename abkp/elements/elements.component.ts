import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CreateReportingWindowService } from 'app/reporting-window/services/create-reporting-window.service';
import { ApiService } from '@hpc/core';

// import { CreateReportingWindowChildComponent } from './../create-reporting-window-child/create-reporting-window-child.component';


@Component({
  selector: 'reporting-window-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ReportingWindowElementsComponent implements OnInit {

  @Input() entry: any;
  public registerForm: FormGroup;

  constructor(
    public apiService: ApiService,
    private fb: FormBuilder,
    // public createReportingWindowService: CreateReportingWindowService
  ) {
      // super(createReportingWindowService, apiService);

      this.registerForm = this.fb.group({
        name: ['', Validators.required],
        context: [''],
        description: [''],
        status: ['', Validators.required]
      });
  }

  ngOnInit() {
    // this.registerForm.reset({
    //   name: this.createReportingWindowService.reportingWindow.value.name,
    //   description: this.createReportingWindowService.reportingWindow.value.description,
    //   context: this.createReportingWindowService.reportingWindow.value.context,
    //   status: this.createReportingWindowService.reportingWindow.status,
    // });
  }

  save(): Observable<any>{
    return of({stopSave:true});
  }
}
