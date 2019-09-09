import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'operation-attachments',
  templateUrl: './operation-attachments.component.html',
  styleUrls: ['./operation-attachments.component.scss']
})
export class OperationAttachmentsComponent implements OnInit {
  public list = [];
  operationId: any;

  constructor(
    private api: ApiService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if(params.id) {
        this.operationId = params.id;
        this.api.getOperationAttachments(this.operationId).subscribe(attachments => {
          this.list = attachments;
          this.list.push({id: null, name: ''});
        });
      }
    });
  }

  addEntry() {
    this.list.push({id: null, name: ''})
  }

  isLastEntryNew() {
    return this.list[this.list.length - 1].id === null;
  }
}
