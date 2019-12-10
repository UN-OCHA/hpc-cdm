import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService, SubmissionsService } from '@cdm/core';

@Component({
  selector: 'xforms',
  templateUrl: './xforms.component.html',
  styleUrls: [ './xforms.component.scss' ]
})
export class XFormsComponent implements OnInit {
  entry;

  constructor(
    private activatedRoute: ActivatedRoute,
    private operationService: OperationService,
    private submissionsService: SubmissionsService){}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(this.operationService.id) {
        this.entry = this.operationService.attachments.find(a => a.formFile.id == params.id);
      }
    });
  }
}
