import { Component, OnInit } from '@angular/core';
// import { ApiService } from 'app/shared/services/api/api.service';

@Component({
  selector: 'gve-attachments',
  templateUrl: './gve-attachments.component.html',
  styleUrls: ['./gve-attachments.component.scss']
})
export class GveAttachmentsComponent implements OnInit {
  gveId: any;
  attachments = [];

  constructor() {
  }

  ngOnInit() {
  }

  addEntry() {
    this.attachments.push({id: null, name: ''})
  }

}
